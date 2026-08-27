import { PrismaClient } from '@prisma/client'
import { setCorsHeaders } from '../_cors'
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { email, code } = req.body
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' })
    }
    // 1. Find verification record
    const record = await prisma.emailVerification.findUnique({
      where: { email },
    })
    if (!record) {
      return res.status(400).json({ error: 'No verification request found' })
    }
    // 2. Check if already used
    if (record.used) {
      return res.status(400).json({ error: 'Verification already used' })
    }
    // 3. Check expiry
    if (record.expiresAt < new Date()) {Verification
      return res.status(400).json({ error: ' code expired' })
    }
    // 4. Check code match
    if (record.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' })
    }
    // 5. Extract signup payload
    const { email: userEmail, password, teamPin, name, sport, team } =
      record.payload as any
    // 6. hash password (NOW inside handler = correct)
    const hashedPassword = await bcrypt.hash(password, 10)
    const hashedPin = await bcrypt.hash(teamPin, 10)
    // 7. create user
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        teamPin: hashedPin,
        name,
        sport,
        team,
      },
    })

    // 8. mark verification used
    await prisma.emailVerification.update({
      where: { email },
      data: { used: true },
    })

    return res.status(200).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        sport: user.sport,
        team: user.team,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      },
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}