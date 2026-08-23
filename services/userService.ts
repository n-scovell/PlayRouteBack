import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

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
}