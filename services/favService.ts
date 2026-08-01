import { prisma } from '../lib/db'

export const favService = {
  async createFavorite(userId: string, playId: string) {
    return prisma.favoritePlay.create({
      data: {
        userId,
        playId,
      },
    });
  },

  async deleteFavorite(userId: string, playId: string) {
    return prisma.favoritePlay.delete({
      where: {
        userId_playId: {
          userId,
          playId,
        },
      },
    })
  },
  async getFavorites(userId: string) {
    return prisma.favoritePlay.findMany({
      where: {
        userId,
      },
      include: {
        play: true,
        notes: true,
      },
    })
  }
}