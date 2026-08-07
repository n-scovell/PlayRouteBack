import { playerService } from '../services/playerService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'POST') {
    try {
      const player = await playerService.createPlayer(req.body)
      return res.status(201).json(player)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create player' })
    }
  }

  if (req.method === 'GET') {
    const { userId } = req.query
    if (userId) {
      const plays = await playerService.getUserPlayers(userId)
      return res.status(200).json(plays)
    }
  }

  
  // if (req.method === 'PATCH') {
  //   try {
  //     const { id, ...data } = req.body
  //     const updatedPlay = await playService.updatePlay(id, data)
  //     return res.status(200).json(updatedPlay)
  //   } catch (err) {
  //     return res.status(500).json({
  //       error: 'Failed to update play',
  //     })
  //   }
  // }
  // if (req.method === 'DELETE') {
  //   try {
  //     const { id } = req.query
  //     await playService.deletePlay(id as string)
  //     return res.status(200).json({
  //       message: 'Play deleted'
  //     })
  //   } catch (err) {
  //     return res.status(500).json({
  //       error: 'Failed to delete play'
  //     })
  //   }
  // }

  return res.status(405).json({ message: 'Method not allowed' })
}