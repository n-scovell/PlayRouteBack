import Stripe from 'stripe'

export const config = {
  api: {
    bodyParser: false
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    })
  }

  const signature = req.headers['stripe-signature']

  if (!signature) {
    return res.status(400).json({
      error: 'Missing Stripe signature'
    })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('STRIPE EVENT:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('CHECKOUT COMPLETED:', session.id)
      console.log('CUSTOMER:', session.customer)
      console.log('EMAIL:', session.customer_details?.email)
    }

    return res.status(200).json({
      received: true
    })
  } catch (err: any) {
    console.error('STRIPE WEBHOOK ERROR:', err.message)

    return res.status(400).json({
      error: `Webhook Error: ${err.message}`
    })
  }
}