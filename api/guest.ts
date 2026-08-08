import { guestService } from '../services/guestService'
import { setCorsHeaders } from './_cors'
export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body

      const guest = await guestService.createGuest(body)

      return res.status(201).json(guest)
    } catch (err) {
      console.error('CREATE GUEST ERROR:', err)

      return res.status(500).json({
        error: err instanceof Error ? err.message : err
      })
    }
  }

}