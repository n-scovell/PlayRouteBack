import { guestService } from '../services/guestService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }



  // if (req.method === "GET") {
  //   const badges = await badgeService.getAllBadges()
  //   return res.status(200).json(badges)
  // }

  if (req.method === 'POST') {
    try {
      const badge = await guestService.createGuest(req.body)
      return res.status(201).json(badge)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create guest' })
    }
  }
  // if (req.method === 'DELETE') {
  //   try {
  //     const { id } = req.body
  //     await badgeService.deleteBadge(id)
  //     return res.status(200).json({
  //       message: 'Badge deleted'
  //     })
  //   } catch (err) {
  //     console.error(err)
  //     return res.status(500).json({
  //       error: err instanceof Error ? err.message : err
  //     })
  //   }
  // }
  // if (req.method === 'PATCH') {
  //   try {
  //     const { id, ...data } = req.body
  //     const badge = await badgeService.updateBadge(id, data)
  //     return res.status(200).json(badge)
  //   } catch (err) {
  //     console.error(err)
  //     return res.status(500).json({
  //       error: err instanceof Error ? err.message : err
  //     })
  //   }
  // }
}