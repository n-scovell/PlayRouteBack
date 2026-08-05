import { prisma } from '../lib/db'
import { BadgeCategory, BadgeTier, RequirementType } from '@prisma/client'
export const badgeService = {


  // async awardBadge(userId: string, badgeId: string) {
  //   return prisma.userBadge.create({
  //     data: {
  //       userId,
  //       badgeId
  //     },
  //   })
  // },
  // async getUserBadges(userId: string) {
  //   return prisma.userBadge.findMany({
  //     where: {
  //       userId
  //     },
  //     include: {
  //       badge: true
  //     },
  //   })
  // },
  async createBadge(data: {
      name: string
      description: string
      icon: string
      category: BadgeCategory
      tier: BadgeTier
      requirementType: RequirementType
      requirementValue: number
  }) {
    return prisma.badge.create({
      data
    })
  },
  async updateBadge(
    id: string,
    data: {
      name?: string
      description?: string
      icon?: string
      category?: BadgeCategory
      tier?: BadgeTier
      requirementType?: RequirementType
      requirementValue?: number
    }
  ){
    return prisma.badge.update({
      where: { id },
      data
    })
  },
  async deleteBadge(id: string) {
    return prisma.badge.delete({
      where: { id }
    })
  },
}