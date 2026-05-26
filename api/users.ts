import { userService } from '../services/userService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  // ADD THIS
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

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