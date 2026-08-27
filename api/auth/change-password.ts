import { userService } from '../../services/userService'
import { setCorsHeaders } from '../_cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export default async function handler(req: any, res: any) {

  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {

    // Get JWT
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
      })
    }

    const token = authHeader.split(' ')[1]

    // Verify JWT
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

    // Get logged-in user
    const user = await userService.getUserById(decoded.userId)

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      })
    }

    // Check current password
    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!validPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect',
      })
    }

    // Make sure new password isn't the same
    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: 'New password cannot be the same as old password',
      })
    }

    // Validate new password
    if (newPassword.length < 10) {
      return res.status(400).json({
        error: 'Password needs to be at least 10 characters',
      })
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password needs 1 capital letter',
      })
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password needs 1 lowercase letter',
      })
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password needs at least 1 number',
      })
    }

    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password needs a special character',
      })
    }

    // updateUser() handles bcrypt hashing
    await userService.updateUser(decoded.userId, {
      password: newPassword,
    })

    return res.status(200).json({
      message: 'Password updated successfully',
    })

  } catch (err) {

    console.error(err)

    return res.status(500).json({
      error: 'Password update failed',
    })
  }
}