import { guestService } from '../services/guestService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method === 'POST') {
    try {
      const play = await guestService.createPlay(req.body)
      return res.status(201).json(play)
    } catch (err: any) {
      if (err.message === 'Guest play limit reached') {
        return res.status(403).json({
          error: 'Guest play limit reached'
        })
      }
      return res.status(500).json({
        error: 'Failed to create play for guest'
      })
    }
  }
  // if (req.method === 'POST') {
  //   try {
  //     const play = await guestService.createPlay(req.body)
  //     return res.status(201).json(play)
  //   } catch (err) {
  //     return res.status(500).json({ error: err })
  //   }
  // }
}

