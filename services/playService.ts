import { prisma } from '../lib/db'

export const playService = {
  async createPlay(data: {
    title: string
    formation: string
    playType: string
    description?: string
    grid?: any
    ownerId: string
    isPublic?: boolean
    }) {
    const { ownerId, ...rest } = data
    return prisma.play.create({
      data: {
        ...rest,
        owner: {
          connect: {
            id: ownerId
          }
        }
      }
    })
  },
async deletePlay(id: string) {
  return prisma.play.delete({
    where: { id }
  })
},

  async getAllPublicPlays() {
    return prisma.play.findMany({
      where: {
        isPublic: true,
      },
      include: {
        owner: true,
      },
    })
  },

  async getUserPlays(userId: string) {
    return prisma.play.findMany({
      where: {
        ownerId: userId,
      },
    })
  },

  async getSharedPlays(userId: string) {
    return prisma.play.findMany({
      where: {
        sharedWith: {
          some: {
            userId,
          },
        },
      },
    })
  },

  async updatePlay(id: string, data: any) {
    return prisma.play.update({
      where: { id },
      data,
    })
  }
}