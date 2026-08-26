import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    })
  }

  console.log('STRIPE WEBHOOK HIT')

  return res.status(200).json({
    received: true
  })
}