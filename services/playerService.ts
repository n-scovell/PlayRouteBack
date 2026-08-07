import { prisma } from '../lib/db'

export const playerService = {

  async createPlayer(data: {
    firstName: string
    lastName: string
    playerNumber?: number
    playerPositions: string
    playerGrade?: string
    userId: string
    }) {
    const { userId, ...rest } = data
    return prisma.player.create({
      data: {
        ...rest,
        user: {
          connect: {
            id: userId
          }
        }
      }
    })
  },

// async deletePlay(id: string) {
//   return prisma.play.delete({
//     where: { id }
//   })
// },

// async getAllPublicPlays() {
//   return prisma.play.findMany({
//     where: {
//       isPublic: true,
//     },
//     include: {
//       owner: true,
//     },
//   })
// },

async getUserPlayers(userId: string) {
  return prisma.player.findMany({
    where: {
      userId: userId,
    },
  })
},

// async getSharedPlays(userId: string) {
//   return prisma.play.findMany({
//     where: {
//       sharedWith: {
//         some: {
//           userId,
//         },
//       },
//     },
//   })
// },

// async updatePlay(id: string, data: any) {
//   return prisma.play.update({
//     where: { id },
//     data,
//   })
// }
}