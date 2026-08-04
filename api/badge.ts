import { badgeService } from '../services/badgeService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  // if (req.method === 'POST') {
  //   const { userId, playId } = req.body;
  //   try {
  //     const favorite = await badgeService.awardBadge(userId, playId);
  //     return res.status(201).json(favorite)
  //   } catch (err) {
  //     console.error(err)
  //     return res.status(500).json({
  //       error: 'Failed to add to favorites'
  //     })
  //   }
  // }

  if (req.method === 'POST') {
    try {
      const badge = await badgeService.createBadge(req.body)
      return res.status(201).json(badge)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create badge' })
    }
  }
  
  if (req.method === 'GET') {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId'
      })
    }
    const favorites = await badgeService.getUserBadges(userId)
    return res.status(200).json(favorites)
  }
}