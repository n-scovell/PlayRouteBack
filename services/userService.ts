import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET!

export const userService = {

  
  async login(email: string, password: string) {
    const user = await this.getUserByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }
    const validPassword = await bcrypt.compare(
      password,
      user.password
    )
    if (!validPassword) {
      throw new Error('Invalid credentials')
    }
    console.log('LOGIN SUBSCRIPTION CHECK:', {
      id: user.id,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
    })
    // if (user.subscriptionStatus !== 'ACTIVE') {
    //   throw new Error('PAYMENT_REQUIRED')
    // }

    const token = jwt.sign(
      {userId: user.id,email: user.email,}, JWT_SECRET,
      {expiresIn: '7d',}
    )
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        sport: user.sport,
        team: user.team,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      },
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.getUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password
    )
    if (!validPassword) {
      throw new Error('Current password is incorrect')
    }
    if (currentPassword === newPassword) {
      throw new Error(
        'New password cannot be the same as old password'
      )
    }
    if (newPassword.length < 10) {
      throw new Error(
        'Password needs to be at least 10 characters'
      )
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error(
        'Password needs 1 capital letter'
      )
    }

    if (!/[a-z]/.test(newPassword)) {
      throw new Error(
        'Password needs 1 lowercase letter'
      )
    }

    if (!/[0-9]/.test(newPassword)) {
      throw new Error(
        'Password needs at least 1 number'
      )
    }

    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      throw new Error(
        'Password needs a special character'
      )
    }

    await this.updateUser(userId, {
      password: newPassword,
    })

    return {
      message: 'Password updated successfully',
    }
  },

  
  async createUser(data: {
    email: string
    password: string
    teamPin?: string
    name?: string
    sport?: string
    team?: string
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const hashedPin = data.teamPin
      ? await bcrypt.hash(data.teamPin, 10)
      : undefined
    const user = await prisma.user.create({
      data: {
        ...data,
        teamPin: hashedPin,
        password: hashedPassword,
      },
    })
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      sport: user.sport,
      team: user.team,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
    }
  },

  async updateUser(
  id: string,
  data: {
    password?: string
    name?: string
    teamPin?: string
    sport?: string
    team?: string
  }
) {
  const updateData = { ...data }

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
  }

  if (updateData.teamPin) {
  updateData.teamPin = await bcrypt.hash(String(updateData.teamPin), 10)
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
  })
},

  async getUsers() {
    return prisma.user.findMany()
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    })
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  async playerLogin(team: string, teamPin: string) {
  const user = await prisma.user.findFirst({
    where: { team },
  })

  if (!user || !user.teamPin) {
    throw new Error('Invalid team or team PIN')
  }

  const validPin = await bcrypt.compare(
    teamPin,
    user.teamPin
  )

  if (!validPin) {
    throw new Error('Invalid team or team PIN')
  }

  const token = jwt.sign(
    {
      userId: user.id,
      access: 'player',
    },
    JWT_SECRET,
    {
      expiresIn: '8h',
    }
  )


  

  return {
    token,
    user: {
      id: user.id,
      team: user.team,
      sport: user.sport,
    },
  }
}


}