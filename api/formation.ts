import { formationService } from '../services/formationService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method === 'GET') {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId'
      })
    }
    const formations = await formationService.getUserFormations(userId)
    return res.status(200).json(formations)
  }

  if (req.method === 'POST') {
    try {
      const formation = await formationService.createFormation(req.body)
      return res.status(201).json(formation)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create formation' })
    }
  }
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      await formationService.deleteFormation(id as string)
      return res.status(200).json({
        message: 'Formation deleted'
      })
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to delete formation'
      })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}