import { PrismaClient } from '@prisma/client'
import { setCorsHeaders } from '../_cors'

const code = Math.floor(100000 + Math.random() * 900000).toString()


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
    const { email, password, name, sport, team } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // 2. expiry (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // 3. store verification record (overwrite if exists)
    await prisma.emailVerification.upsert({
      where: { email },
      update: {
        code,
        expiresAt,
        payload: {
          email,
          password, // IMPORTANT: hash later (we’ll fix this next step)
          name,
          sport,
          team,
        },
        used: false,
      },
      create: {
        email,
        code,
        expiresAt,
        payload: {
          email,
          password,
          name,
          sport,
          team,
        },
      },
    })

    // 4. send email (stub for now)
    console.log(`Verification code for ${email}: ${code}`)

    // later replace with Resend:
    // await resend.emails.send({...})

    return res.status(200).json({
      success: true,
      message: 'Verification code sent',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}