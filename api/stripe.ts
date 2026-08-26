import Stripe from 'stripe'
import { setCorsHeaders } from './_cors'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function getRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(
      Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk)
    )
  }

  return Buffer.concat(chunks)
}

export default async function handler(req: any, res: any) {

  console.log(
    'STRIPE REQUEST:',
    req.method,
    req.headers.origin
  )
  // CORS MUST happen first
  setCorsHeaders(res)

  // Handle browser preflight BEFORE reading the body
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {

    const rawBody = await getRawBody(req)

    const signature = req.headers['stripe-signature']

    // --------------------------------
    // STRIPE WEBHOOK
    // --------------------------------

    if (signature) {

      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

      console.log('STRIPE EVENT:', event.type)

      if (event.type === 'checkout.session.completed') {

        const session =
          event.data.object as Stripe.Checkout.Session

        console.log(
          'CHECKOUT COMPLETED:',
          session.id
        )

        console.log(
          'CUSTOMER:',
          session.customer
        )

        console.log(
          'EMAIL:',
          session.customer_details?.email
        )

        console.log(
          'USER ID:',
          session.metadata?.userId
        )

        console.log(
          'PLAN:',
          session.metadata?.plan
        )
      }

      return res.status(200).json({
        received: true,
      })
    }

    // --------------------------------
    // CREATE CHECKOUT
    // --------------------------------

    const body = JSON.parse(rawBody.toString())

    if (body.action !== 'create-checkout') {
      return res.status(400).json({
        error: 'Invalid action',
      })
    }

    const {
      userId,
      plan,
    } = body

    if (!userId || !plan) {
      return res.status(400).json({
        error: 'User ID and plan are required',
      })
    }

    if (plan !== 'COACH') {
      return res.status(400).json({
        error: 'Invalid plan',
      })
    }

    const priceId =
      process.env.STRIPE_COACH_PRICE_ID

    if (!priceId) {
      return res.status(500).json({
        error: 'Stripe Coach price is not configured',
      })
    }

    const session =
      await stripe.checkout.sessions.create({

        mode: 'subscription',

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        metadata: {
          userId,
          plan,
        },

        success_url:
          'https://playerroutes.com/register?payment=success',

        cancel_url:
          'https://playerroutes.com/register?payment=cancelled',
      })

    return res.status(200).json({
      url: session.url,
    })

  } catch (err: any) {

    console.error(
      'STRIPE ERROR:',
      err.message
    )

    return res.status(400).json({
      error: err.message || 'Stripe request failed',
    })
  }
}