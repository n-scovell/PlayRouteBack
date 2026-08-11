import { guestFormation } from '../services/guestFormation'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'GET') {
    const { guestId } = req.query
    const plays = await guestFormation.getGuestFormations(guestId)
    return res.status(200).json(plays)
  }
  if (req.method === 'POST') {
    try {
      const play = await guestFormation.createFormation(req.body)
      return res.status(201).json(play)
    } catch (err: any) {
      if (err.message === 'Guest formation limit reached') {
        return res.status(403).json({
          error: 'Guest formation limit reached'
        })
      }
      return res.status(500).json({
        error: err
      })
    }
  }
}

