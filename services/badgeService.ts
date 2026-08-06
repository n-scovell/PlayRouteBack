import { prisma } from '../lib/db'
import { Prisma } from "@prisma/client"
import { BadgeCategory, BadgeTier, RequirementType } from '@prisma/client'
export const badgeService = {
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
  async getAllBadges() {
    return prisma.badge.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { category: "asc" }
      ]
    })
  },
  async updateBadge(id: string, data: Prisma.BadgeUpdateInput) {
    return prisma.badge.update({ where: { id }, data })
  },
  async deleteBadge(id: string) {
    return prisma.badge.delete({
      where: { id }
    })
  },
  async assignBadge(userId: string, badgeId: string) {
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    })
    if (existing) return existing
    return prisma.userBadge.create({
      data: {
        userId,
        badgeId
      }
    })
  },
  async getUserBadges(userId: string) {
    return prisma.userBadge.findMany({
      where: {
        userId
      },
      include: {
        badge: true
      }
    })
  }
}