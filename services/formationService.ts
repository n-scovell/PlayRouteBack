import { prisma } from '../lib/db'
// import { Prisma } from '@prisma/client'
// const MASTER_USER_ID = 'cmph8piyd00009apgl98o8gok'
  export const formationService = {
    async createFormation(data: {
    formationName: string
    pursuit: string
    grid?: any
    ownerId: string
  }) {
    const { ownerId, ...rest } = data
    return prisma.formation.create({
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
  async deleteFormation(id: string) {
    return prisma.formation.delete({
      where: { id }
    })
  },

  async getUserFormations(userId: string) {
    return prisma.formation.findMany({
      where: {
        OR: [
          { ownerId: userId },
          // { ownerId: MASTER_USER_ID }
        ]
      },
    })
  },

}