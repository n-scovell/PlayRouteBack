import { badgeService } from '../services/badgeService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method === 'POST') {
    try {
      const badge = await badgeService.createBadge(req.body)
      return res.status(201).json(badge)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create badge' })
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      await badgeService.deleteBadge(id as string)
      return res.status(200).json({
        message: 'Badge deleted'
      })
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to delete badge'
      })
    }
  }
}