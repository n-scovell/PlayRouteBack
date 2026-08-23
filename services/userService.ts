import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET!

export const userService = {
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

    return prisma.user.create({
      data: {
        ...data,
        teamPin: hashedPin,
        password: hashedPassword,
      },
    })
  },

  async updateUser(
    id: string,
    data: {
      password?: string
      name?: string
      teamPin?: string
      sport?: string
      team?: string
    }) {
      const updateData = { ...data }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10)
      }
      if (updateData.teamPin) {
        updateData.teamPin = await bcrypt.hash(updateData.teamPin, 10)
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