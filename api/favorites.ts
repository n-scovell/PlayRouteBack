import { favService } from '../services/favService'
import { setCorsHeaders } from './_cors'

//OPTIONS, POST, DELETE
export default async function handler(req: any, res: any) {
  
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method === 'POST') {
    const { userId, playId } = req.body;
    try {
      const favorite = await favService.createFavorite(userId, playId);
      return res.status(201).json(favorite)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to add to favorites' })
    }
  }
  if (req.method === 'GET') {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId'
      })
    }
    const favorites = await favService.getFavorites(userId)
    return res.status(200).json(favorites)
  }
  if (req.method === 'DELETE') {
    const { userId, playId } = req.body;
    try {
      await favService.deleteFavorite(userId, playId);
      return res.status(200).json({
        message: 'Favorite deleted'
      })
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to delete favorite'
      })
    }
  }
}