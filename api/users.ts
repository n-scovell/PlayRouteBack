import { userService } from '../services/userService'
import { setCorsHeaders } from './_cors'

export default async function handler(req: any, res: any) {
  // ADD THIS
  setCorsHeaders(res)

  const { action } = req.body

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const users = await userService.getUsers()
    return res.status(200).json(users)
  }

  if (req.method === 'PUT') {
    const { id, action, ...data } = req.body
    console.log('ID:', id)
    console.log('ACTION:', action)
    console.log('DATA:', data)
    const user = await userService.updateUser(id, data)
    return res.status(200).json(user)
  } 


  if (req.method === 'POST') {
    try {
      const { action } = req.body
      if (action === 'login') {
        const { email, password } = req.body
        const result = await userService.login(email, password)
        return res.status(200).json(result)
      }
      if (action === 'player-login') {
        const { team, teamPin } = req.body
        if (!team || !teamPin) {
          return res.status(400).json({
            error: 'Team and team PIN are required'
          })
        }
        const result = await userService.playerLogin(team, teamPin)
        return res.status(200).json(result)
      }
      if (action === 'create') {
        const user = await userService.createUser(req.body)
        return res.status(201).json(user)
      }
      return res.status(400).json({
        error: 'Invalid action'
      })
    } catch (err: any) {
      console.error('USER API ERROR:', err)
      return res.status(500).json({
        error: err.message || 'User operation failed'
      })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}