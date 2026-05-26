export function setCorsHeaders(res: any) {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://play-routes-front.vercel.app/'
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