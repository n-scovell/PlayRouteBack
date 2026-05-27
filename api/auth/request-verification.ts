import { PrismaClient } from '@prisma/client'
import { setCorsHeaders } from '../_cors'
import { Resend } from "resend"
import bcrypt from 'bcryptjs'

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

    // 🔐 hash password BEFORE storing anywhere
    const hashedPassword = await bcrypt.hash(password, 10)

    // generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.emailVerification.upsert({
      where: { email },
      update: {
        code,
        expiresAt,
        payload: {
          email,
          password: hashedPassword, // ✅ secure now
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
          password: hashedPassword, // ✅ secure now
          name,
          sport,
          team,
        },
      },
    })

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: "PlayRoutes <onboarding@resend.dev>",
      to: email,
      subject: "Your verification code",
      html: `<p>Your code is <b>${code}</b></p>`,
    })

    return res.status(200).json({
      success: true,
      message: 'Verification code sent',
    })

  } catch (err) {
    console.error(err)

    return res.status(500).json({
      error: 'Server error',
    })
  }
}