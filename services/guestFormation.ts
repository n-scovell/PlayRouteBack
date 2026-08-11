import { prisma } from '../lib/db'

const GUEST_PLAY_LIMIT = 5
const GUEST_FORMATION_LIMIT = 5

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

  async createFormation(data: {
    formationName: string
    grid?: any
    guestId: string
  }) {
    const { guestId, ...rest } = data
    const formationCount = await prisma.guestFormation.count({
      where: {
        guestId
      }
    })
    if (formationCount >= GUEST_FORMATION_LIMIT) {
      throw new Error('Guest formation limit reached')
    }
    return prisma.guestFormation.create({
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

  async getGuestPlays(guestId: string) {
    return prisma.guestPlay.findMany({
      where: {
        guestId: guestId,
      },
    })
  },
  async getGuestFormations(guestId: string) {
    return prisma.guestFormation.findMany({
      where: {
        guestId: guestId,
      },
    })
  },
}