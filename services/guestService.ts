import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

export const guestService = {
  async createGuest(data: {
      name: string
      description: string
    }) {
    const guestExpiresAt = new Date()
    // guestExpiresAt.setDate(guestExpiresAt.getDate() + 7)
    guestExpiresAt.setHours(guestExpiresAt.getHours() + 24)
    return prisma.guest.create({
      data: {
        ...data,
        guestExpiresAt
      }
    })
  }

  // async updateUser(
  //   id: string,
  //   data: {
  //     password?: string
  //     name?: string
  //     sport?: string
  //     team?: string
  //   }) {
  //     const updateData = { ...data }

  //     if (updateData.password) {
  //       updateData.password = await bcrypt.hash(updateData.password, 10)
  //     }

  //     return prisma.user.update({
  //       where: { id },
  //       data: updateData,
  //     })
  // },

  // async getUsers() {
  //   return prisma.user.findMany()
  // },

  // async getUserById(id: string) {
  //   return prisma.user.findUnique({
  //     where: { id },
  //   })
  // },

  // async getUserByEmail(email: string) {
  //   return prisma.user.findUnique({
  //     where: { email },
  //   })
  // },
}