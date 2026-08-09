import { prisma } from '../lib/db'

const GUEST_PLAY_LIMIT = 5

export const guestService = {
  async createGuest(data: {
      name: string
      email: string
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
    email: string
    playType: string
    description?: string
    grid?: any
    guestId: string
  }) {
    const { guestId, ...rest } = data
    const playCount = await prisma.guestPlay.count({
      where: {
        guestId
      }
    })
    if (playCount >= GUEST_PLAY_LIMIT) {
      throw new Error('Guest play limit reached')
    }
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