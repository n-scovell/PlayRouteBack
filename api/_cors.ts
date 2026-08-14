export function setCorsHeaders(res: any) {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://www.playerroutes.com',
    'https://playerroutes.com',
    'https://play-routes-front.vercel.app'
  ]

  const origin = res.req?.headers?.origin

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,DELETE,PATCH,PUT,OPTIONS'
  )

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
}