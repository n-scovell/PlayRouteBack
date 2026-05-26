export function setCorsHeaders(res: any) {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'http://localhost:5173',
    'https://your-app.vercel.app'
  )

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,DELETE,PATCH,OPTIONS'
  )

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
}