import { PrismaClient } from '@prisma/client'
import { setCorsHeaders } from '../_cors'

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
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Verification code expired' })
    }

    // 4. Check code match
    if (record.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' })
    }

    // 5. Extract signup payload
    const { email: userEmail, password, name, sport, team } =
      record.payload as any

    // 6. Create actual user
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password, // IMPORTANT: hash later (next upgrade step)
        name,
        sport,
        team,
      },
    })

    // 7. Mark verification as used (optional safety)
    await prisma.emailVerification.update({
      where: { email },
      data: { used: true },
    })

    // OR you could delete it instead:
    // await prisma.emailVerification.delete({ where: { email } })

    // 8. Success response
    return res.status(200).json({
      success: true,
      message: 'Account created successfully',
      user,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}