import { userService } from '../services/userService'
import { setCorsHeaders } from './_cors'
import { loginSchema, playerLoginSchema, createUserSchema, updateSchema } from '../schema/userSchema'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method === 'GET') {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    const user = await userService.getUserById(userId)
    return res.status(200).json(user)
  }
  if (req.method === 'PUT') {
    const validation = updateSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid profile information',
        issues: validation.error.flatten().fieldErrors
      })
    }
    const { id, action, ...data } = validation.data
    const user = await userService.updateUser(id, data)
    return res.status(200).json(user)
  }
  if (req.method === 'POST') {
    try {
      const { action } = req.body || {}
      if (action === 'login') {
        const validation = loginSchema.safeParse(req.body)
        if (!validation.success) {
          return res.status(400).json({
            error: 'Invalid login information',
            issues: validation.error.flatten().fieldErrors
          })
        }
        const { email, password } = req.body
        const result = await userService.login(email, password)
        return res.status(200).json(result)
      }

      if (action === 'player-login') {
        const validation = playerLoginSchema.safeParse(req.body)
        if (!validation.success) {
          return res.status(400).json({
            error: 'Invalid login information',
            issues: validation.error.flatten().fieldErrors
          })
        }
        const { team, teamPin } = validation.data
        if (!team || !teamPin) {
          return res.status(400).json({
            error: 'Team and team PIN are required'
          })
        }
        const result = await userService.playerLogin(team, teamPin)
        return res.status(200).json(result)
      }
      if (action === 'create') {
        const validation = createUserSchema.safeParse(req.body)
        if (!validation.success) {
          return res.status(400).json({
            error: 'Invalid login information',
            issues: validation.error.flatten().fieldErrors
          })
        }
        const user = await userService.createUser(validation.data)
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

  return res.status(405).json({
    message: 'Method not allowed'
  })
}