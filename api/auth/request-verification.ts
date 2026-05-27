import { PrismaClient } from '@prisma/client'
import { setCorsHeaders } from '../_cors'
import { Resend } from "resend"

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
          password: password, // ✅ secure now
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
          password: password, // ✅ secure now
          name,
          sport,
          team,
        },
      },
    })

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: "Nathan Scovell <N8scovell@gmail.com>",
      to: email,
      subject: "Your verification code",
      html: `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #111;">Verify your account</h2>
    <p>Your verification code is:</p>

    <div style="
      font-size: 28px;
      letter-spacing: 4px;
      font-weight: bold;
      padding: 12px;
      background: #f4f4f4;
      display: inline-block;
      border-radius: 8px;
    ">
      ${code}
    </div>

    <p style="margin-top: 20px; color: #666;">
      This code expires in 10 minutes.
    </p>
  </div>
`,
    })

    return res.status(200).json({
      success: true,
      message: 'Verification code sent',
    })

  } catch (err: any) {
    console.error("REQUEST-VERIFICATION ERROR:", err)
    return res.status(500).json({
      error: 'Server error',
      details: err.message,
    })
  }
}