import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

export const userService = {
  async createUser(data: {
    email: string
    password: string
    name?: string
    sport?: string
    team?: string
  }) {

    // 🔐 Hash password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10)

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
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