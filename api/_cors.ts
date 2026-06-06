export function setCorsHeaders(res: any) {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://play-routes-front.vercel.app' // <-- your real Vercel URL
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