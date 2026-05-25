// import { userService } from '@/services/userService'
import { userService } from '../services/userService'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const users = await userService.getUsers()
    return res.status(200).json(users)
  }

  if (req.method === 'POST') {
    try {
      const user = await userService.createUser(req.body)
      return res.status(201).json(user)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create user' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}