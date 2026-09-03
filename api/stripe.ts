import Stripe from 'stripe'
import { setCorsHeaders } from './_cors'
import { prisma } from '../lib/db'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!
)

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
  console.log('STRIPE REQUEST:', req.method, req.headers.origin)
  setCorsHeaders(res)
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
    if (signature) {
      const event =
        stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        )
      console.log('STRIPE EVENT:', event.type)
      if (event.type === 'invoice.paid') {
        const invoice = event.data.object as Stripe.Invoice
        const subscription = invoice.parent?.subscription_details?.subscription
        const subscriptionId =
          typeof subscription === 'string'
            ? subscription
            : subscription?.id
        if (!subscriptionId) {
          throw new Error(
            'Missing subscription ID'
          )
        }

        const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscriptionData.metadata?.userId
        const plan = subscriptionData.metadata?.plan
        const customerId =
          typeof subscriptionData.customer === 'string'
            ? subscriptionData.customer
            : subscriptionData.customer?.id
        console.log('INVOICE PAID:', invoice.id)
        console.log('USER ID:', userId)
        console.log('PLAN:', plan)
        console.log('CUSTOMER:', customerId)
        console.log('SUBSCRIPTION:', subscriptionId)
        if (!userId || !plan) {
          throw new Error('Missing userId or plan in subscription metadata')
        }
        if (!customerId) {
          throw new Error('Missing Stripe customer')
        }
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            plan: plan as 'COACH' | 'TEAM',
            subscriptionStatus: 'ACTIVE',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        })
        const amounts = {
          COACH: 600,
          TEAM: 1000,
        }
        const amount = amounts[plan as keyof typeof amounts]
        const existingPayment =
          await prisma.payment.findFirst({
            where: {
              stripePaymentId:
                invoice.id,
            },
          })
        if (!existingPayment) {
          await prisma.payment.create({
            data: {
              userId,
              amount,
              plan:
                plan as 'COACH' | 'TEAM',
              status: 'PAID',
              stripePaymentId:
                invoice.id,
              paidAt: new Date(),
            },
          })
        }
        console.log(
          'PLAYER ROUTES ACCOUNT ACTIVATED'
        )
      }

      // ==================================================
      // PAYMENT FAILED
      // ==================================================

      if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice
        const subscription = invoice.parent?.subscription_details?.subscription
        const subscriptionId =
          typeof subscription === 'string'
            ? subscription
            : subscription?.id
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.userId
          if (userId) {
            await prisma.user.update({
              where: {
                id: userId,
              },
              data: {
                subscriptionStatus: 'PAST_DUE',
              },
            })
          }
        }
        console.log('STRIPE PAYMENT FAILED:', invoice.id)
      }

      // ==================================================
      // SUBSCRIPTION CANCELLED
      // ==================================================

      if ( event.type ==='customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        if (userId) {
          await prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              subscriptionStatus:
                'CANCELED',
            },
          })
        }
        console.log('SUBSCRIPTION CANCELLED:', subscription.id)
      }
      return res.status(200).json({
        received: true,
      })
    }

    // ==================================================
    // FRONTEND REQUEST
    // ==================================================

    const body = JSON.parse(
      rawBody.toString()
    )

    // --------------------------------
    // CREATE SUBSCRIPTION
    // --------------------------------

    if (body.action !== 'create-subscription') {
      return res.status(400).json({
        error: 'Invalid action for creating subscription',
      })
    }
    const {userId,plan,} = body

    // --------------------------------
    // Validate user
    // --------------------------------
    if (!userId || !plan) {
      return res.status(400).json({
        error:
          'User ID and plan are required',
      })
    }

    // --------------------------------
    // Validate plan
    // --------------------------------

    if (!['COACH', 'TEAM'].includes(plan)) {
      return res.status(400).json({
        error: 'Invalid plan',
      })
    }

    // ==================================================
    // GET STRIPE PRICE
    // ==================================================

    const prices = {
      COACH:
        process.env.STRIPE_COACH_PRICE_ID!,

      TEAM:
        process.env.STRIPE_TEAM_PRICE_ID!,
    }

    const priceId =
      prices[
        plan as keyof typeof prices
      ]

    if (!priceId) {
      return res.status(500).json({
        error:
          `Stripe ${plan} price is not configured`,
      })
    }

    // ==================================================
    // CREATE CUSTOMER
    // ==================================================

    const customer =
      await stripe.customers.create({
        metadata: {
          userId,
        },
      })

    console.log('STRIPE CUSTOMER CREATED:', customer.id)

    // ==================================================
    // CREATE SUBSCRIPTION
    // ==================================================

    const subscription =
      await stripe.subscriptions.create({
        customer: customer.id,

        items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        payment_behavior:
          'default_incomplete',

        payment_settings: {
          save_default_payment_method:
            'on_subscription',
        },

        metadata: {
          userId,
          plan,
        },

        expand: ['latest_invoice',],
      })

    console.log(
      'STRIPE SUBSCRIPTION CREATED:',
      subscription.id
    )

    // ==================================================
    // GET PAYMENT INTENT
    // ==================================================

    const invoice = subscription.latest_invoice
    console.log('STRIPE INVOICE:',JSON.stringify(invoice, null, 2))
    if (!invoice || typeof invoice === 'string') {
      throw new Error(
        'Stripe did not return the subscription invoice'
      )
    }
    const payment = invoice.payments?.data?.[0]
    if (!payment) {
      throw new Error(
        'Stripe did not return an invoice payment'
      )
    }
    const paymentIntentId = payment.payment.payment_intent

    if (
      !paymentIntentId ||
      typeof paymentIntentId !== 'string'
    ) {
      throw new Error(
        'Stripe did not return a payment intent'
      )
    }

    const paymentIntent =
      await stripe.paymentIntents.retrieve(
        paymentIntentId
      )

    if (!paymentIntent.client_secret) {
      throw new Error(
        'Stripe payment intent has no client secret'
      )
    }

    // ==================================================
    // RETURN PAYMENT ELEMENT DATA
    // ==================================================

    return res.status(200).json({
      clientSecret:
        paymentIntent.client_secret,

      subscriptionId:
        subscription.id,

      customerId:
        customer.id,
    })

  } catch (err: any) {
    console.error(
      'STRIPE ERROR:',
      err
    )

    return res.status(400).json({
      error:
        err.message ||
        'Stripe request failed',
    })
  }
}