// import { userService } from '../../services/userService'
// import { setCorsHeaders } from '../_cors'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

// const JWT_SECRET = process.env.JWT_SECRET!

// export default async function handler(req: any, res: any) {
//   setCorsHeaders(res)
  
//   // Handle preflight request
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end()
//   }
//   if (req.method !== 'POST') {
//     return res.status(405).json({
//       message: 'Method not allowed',
//     })
//   }

//   try {
//     const { email, password } = req.body

//     const user = await userService.getUserByEmail(email)

//     if (!user) {
//       return res.status(401).json({
//         error: 'Invalid credentials',
//       })
//     }

//     const validPassword = await bcrypt.compare(
//       password,
//       user.password
//     )

//     if (!validPassword) {
//       return res.status(401).json({
//         error: 'Invalid credentials',
//       })
//     }

//     const token = jwt.sign(
//       {
//         userId: user.id,
//         email: user.email,
//       },
//       JWT_SECRET,
//       {
//         expiresIn: '7d',
//       }
//     )
//     return res.status(200).json({
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         sport: user.sport,
//         team: user.team
//       }
//     })
//   } catch (err) {
//     return res.status(500).json({
//       error: 'Login failed',
//     })
//   }
// }

import { setCorsHeaders } from '../_cors'

export default async function handler(req: any, res: any) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({
    message: 'login route works'
  })
}