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
  },
  async createPlay(data: {
    title: string
    formation: string
    playType: string
    description?: string
    grid?: any
    guestId: string
    }) {
    const { guestId, ...rest } = data
    return prisma.guestPlay.create({
      data: {
        ...rest,
        guest: {
          connect: {
            id: guestId
          }
        }
      }
    })
  },
}