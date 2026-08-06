import { badgeService } from '../services/badgeService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method === "POST") {
    try {
      const { userId, badgeId } = req.body
      if (!userId || !badgeId) {
        return res.status(400).json({
          error: "userId and badgeId are required"
        })
      }
      const badge = await badgeService.assignBadge(userId, badgeId)
      return res.status(201).json(badge)
    } catch (err) {
      return res.status(500).json({
        error: "Failed to assign badge"
      })
    }
  }
  if (req.method === "GET") {
    const { userId } = req.query
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        error: "userId is required"
      })
    }
    const userBadges = await badgeService.getUserBadges(userId)
    return res.status(200).json(userBadges)
  }
}