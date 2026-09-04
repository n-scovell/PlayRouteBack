import { userService } from '../../services/userService'
import { setCorsHeaders } from '../_cors'
// import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed dude',
    })
  }

  const { action } = req.body

  if (action === 'login') {

    try {
      const { email, password } = req.body
      const result = await userService.login(email, password)
      return res.status(200).json(result)
    } catch (err: any) {
      if (err.message === 'PAYMENT_REQUIRED') {
        return res.status(402).json({
          error: 'PAYMENT_REQUIRED',
          message: 'Please complete your subscription.'
        })
      }
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials'
      })
    }
  }
  if (action === 'change-password') {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
      })
    }
    const token = authHeader.split(' ')[1]
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch {
      return res.status(401).json({
        error: 'Invalid or expired token',
      })
    }
    const {
      currentPassword,
      newPassword,
    } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required',
      })
    }

    const result = await userService.changePassword(
      decoded.userId,
      currentPassword,
      newPassword
    )

    return res.status(200).json(result)

  } catch (err: any) {

    console.error('PASSWORD UPDATE ERROR:', err)

    return res.status(400).json({
      error: err.message || 'Password update failed',
    })
  }
}

  return res.status(400).json({
    error: 'Invalid action',
  })
}