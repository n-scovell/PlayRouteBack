import { prisma } from '../lib/db'

const GUEST_FORMATION_LIMIT = 5

export const guestFormation = {
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
  async getGuestFormations(guestId: string) {
    return prisma.guestFormation.findMany({
      where: {
        guestId: guestId,
      },
    })
  },
}