import { guestFormation } from '../services/guestFormation'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const { guestId } = req.query
    const formations = await guestFormation.getGuestFormations(guestId)
    return res.status(200).json(formations)
  }

  if (req.method === 'POST') {
    try {
      const formation = await guestFormation.createFormation(req.body)
      return res.status(201).json(formation)
    } catch (err: any) {
      if (err.message === 'Guest formation limit reached') {
        return res.status(403).json({
          error: 'Guest formation limit reached'
        })
      }

      console.error('GUEST FORMATION ERROR:', err)

      return res.status(500).json({
        error: err.message || 'Failed to create guest formation'
      })
    }
  }

  return res.status(405).json({
    error: 'Method not allowed'
  })
}