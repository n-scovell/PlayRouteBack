// import Stripe from 'stripe'
// import { setCorsHeaders } from './_cors'
// import { prisma } from '../lib/db'
// import jwt from 'jsonwebtoken'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// const stripe = new Stripe(
//   process.env.STRIPE_SECRET_KEY!
// )
// async function getRawBody(req: any): Promise<Buffer> {
//   const chunks: Buffer[] = []
//   for await (const chunk of req) {
//     chunks.push(
//       Buffer.isBuffer(chunk)
//         ? chunk
//         : Buffer.from(chunk)
//     )
//   }
//   return Buffer.concat(chunks)
// }

// export default async function handler(req: any, res: any) {
//   console.log('STRIPE REQUEST:',req.method,req.headers.origin)
//   setCorsHeaders(res)
//   if (req.method === 'OPTIONS') {
//     return res.status(204).end()
//   }
//   if (req.method !== 'POST') {
//     return res.status(405).json({
//       error: 'Method not allowed',
//     })
//   }
//   try {
//     const rawBody = await getRawBody(req)
//     // ==================================================
//     // STRIPE WEBHOOK
//     // ==================================================
//     const signature = req.headers['stripe-signature']
//     if (signature) {
//       const event =
//         stripe.webhooks.constructEvent(
//           rawBody,
//           signature,
//           process.env.STRIPE_WEBHOOK_SECRET!
//         )
//       console.log('STRIPE EVENT:', event.type)

//       // ==================================================
//       // PAYMENT SUCCESSFUL
//       // ==================================================
//       if (event.type === 'customer.subscription.updated') {
//         const subscription = event.data.object
//         const customerId = subscription.customer as string
//         const priceId = subscription.items.data[0].price.id
//         console.log('SUBSCRIPTION UPDATED')
//         console.log('Customer:', customerId)
//         console.log('Price:', priceId)
//         console.log('Coach Price:', process.env.STRIPE_COACH_PRICE_ID)
//         console.log('Team Price:', process.env.STRIPE_TEAM_PRICE_ID)


//         let plan: 'COACH' | 'TEAM'
//         if (priceId === process.env.STRIPE_COACH_PRICE_ID) {
//         plan = 'COACH'
//         } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
//         plan = 'TEAM'
//         } else {
//         console.error('Unknown Stripe price:', priceId)
//         return
//         }
//         const updatedUser = await prisma.user.update({
//           where: {
//             stripeCustomerId: customerId
//           },
//           data: {
//             plan
//           }
//         })

//         console.log(
//           'USER PLAN UPDATED:',
//           updatedUser.id,
//           updatedUser.plan
//         )
//       }
//       if (event.type === 'invoice.paid') {
//         const invoice =
//           event.data.object as Stripe.Invoice

//         const subscription =
//           invoice.parent
//             ?.subscription_details
//             ?.subscription

//         const subscriptionId =
//           typeof subscription === 'string'
//             ? subscription
//             : subscription?.id

//         if (!subscriptionId) {
//           throw new Error(
//             'Missing subscription ID'
//           )
//         }

//         const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId)
//         const userId = subscriptionData.metadata?.userId
//         const plan = subscriptionData.metadata?.plan
//         const customerId =
//           typeof subscriptionData.customer === 'string'
//             ? subscriptionData.customer
//             : subscriptionData.customer?.id

//         if (!userId || !plan) {
//           throw new Error(
//             'Missing userId or plan in subscription metadata'
//           )
//         }

//         if (!customerId) {
//           throw new Error(
//             'Missing Stripe customer'
//           )
//         }

//         // -----------------------------------------------
//         // ACTIVATE USER
//         // -----------------------------------------------

//         await prisma.user.update({
//           where: {
//             id: userId,
//           },
//           data: {
//             plan:
//               plan as 'COACH' | 'TEAM',

//             subscriptionStatus:
//               'ACTIVE',

//             stripeCustomerId:
//               customerId,

//             stripeSubscriptionId:
//               subscriptionId,
//           },
//         })

//         // -----------------------------------------------
//         // RECORD PAYMENT
//         // -----------------------------------------------

//         const amounts = {
//           COACH: 600,
//           TEAM: 1000,
//         }

//         const amount =
//           amounts[
//             plan as keyof typeof amounts
//           ]

//         const existingPayment =
//           await prisma.payment.findFirst({
//             where: {
//               stripePaymentId:
//                 invoice.id,
//             },
//           })

//         if (!existingPayment) {
//           await prisma.payment.create({
//             data: {
//               userId,

//               amount,

//               plan:
//                 plan as 'COACH' | 'TEAM',

//               status: 'PAID',

//               stripePaymentId:
//                 invoice.id,

//               paidAt: new Date(),
//             },
//           })
//         }

//         console.log(
//           'PLAYER ROUTES ACCOUNT ACTIVATED'
//         )
//       }

//       // ==================================================
//       // PAYMENT FAILED
//       // ==================================================

//       if (event.type === 'invoice.payment_failed') {
//         const invoice = event.data.object as Stripe.Invoice
//         const subscription =
//           invoice.parent
//             ?.subscription_details
//             ?.subscription

//         const subscriptionId =
//           typeof subscription === 'string'
//             ? subscription
//             : subscription?.id

//         if (subscriptionId) {
//           const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId)
//           const userId = subscriptionData.metadata?.userId
//           if (userId) {
//             await prisma.user.update({
//               where: {
//                 id: userId,
//               },
//               data: {
//                 subscriptionStatus:
//                   'PAST_DUE',
//               },
//             })
//           }
//         }
//         console.log('STRIPE PAYMENT FAILED:',invoice.id)
//       }
//       // ==================================================
//       // SUBSCRIPTION CANCELLED
//       // ==================================================
//       if (event.type === 'customer.subscription.deleted') {
//         const subscription = event.data.object as Stripe.Subscription
//         const userId = subscription.metadata?.userId
//         if (userId) {
//           await prisma.user.update({
//             where: {
//               id: userId,
//             },
//             data: {
//               subscriptionStatus:
//                 'CANCELED',
//             },
//           })
//         }
//         console.log('SUBSCRIPTION CANCELLED:',subscription.id)
//       }
//       return res.status(200).json({
//         received: true,
//       })
//     }
//     // ==================================================
//     // FRONTEND REQUEST
//     // ==================================================
//     const body = JSON.parse(rawBody.toString())

//     if (body.action === 'manage-subscription') {
        

//       const authHeader = req.headers.authorization

//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//           return res.status(401).json({
//               error: 'Authentication required',
//           })
//       }

//       const token = authHeader.split(' ')[1]

//       const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET!
//       ) as { userId: string }

//       const userId = decoded.userId

//       const user = await prisma.user.findUnique({
//       where: {
//       id: userId,
//       },
//       select: {
//       stripeCustomerId: true,
//       },
//       })

//       if (!user?.stripeCustomerId) {
//       return res.status(400).json({
//       error: 'No Stripe customer found for this user',
//       })
//       }

//       const session =
//       await stripe.billingPortal.sessions.create({
//       customer: user.stripeCustomerId,
//       return_url: 'https://playerroutes.com/profile',
//       })

//       return res.status(200).json({
//       url: session.url,
//       })


//     }

//     if (body.action === 'create-subscription') {
//       // ==================================================
//       // CREATE SUBSCRIPTION REQUEST
//       // ==================================================

//       // if (body.action !== 'create-subscription') {
//       //   return res.status(400).json({
//       //     error:
//       //       'Invalid action for creating subscription',
//       //   })
//       // }
//       const { userId, plan } = body

//       const authHeader = req.headers.authorization
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({
//           error: 'Authentication required',
//         })
//       }
//       const token = authHeader.split(' ')[1]
//       const decoded = jwt.verify(
//           token,
//           process.env.JWT_SECRET!
//       )
//       // ==================================================
//       // VALIDATE USER
//       // ==================================================
//       if (!userId || !plan) {
//         return res.status(400).json({
//           error:
//             'User ID and plan are required',
//         })
//       }

//       // ==================================================
//       // VALIDATE PLAN
//       // ==================================================

//       if (!['COACH', 'TEAM'].includes(plan)) {
//         return res.status(400).json({
//           error: 'Invalid plan',
//         })
//       }

//       // ==================================================
//       // GET STRIPE PRICE
//       // ==================================================

//       const prices = {
//         COACH:
//           process.env.STRIPE_COACH_PRICE_ID!,

//         TEAM:
//           process.env.STRIPE_TEAM_PRICE_ID!,
//       }

//       const priceId =
//         prices[
//           plan as keyof typeof prices
//         ]

//       if (!priceId) {
//         return res.status(500).json({
//           error:
//             `Stripe ${plan} price is not configured`,
//         })
//       }

//       // ==================================================
//       // CREATE STRIPE CUSTOMER
//       // ==================================================

//       const customer =
//         await stripe.customers.create({
//           metadata: {
//             userId,
//           },
//         })

//       console.log(
//         'STRIPE CUSTOMER CREATED:',
//         customer.id
//       )

//       // ==================================================
//       // CREATE STRIPE SUBSCRIPTION
//       // ==================================================

//       const subscription =
//         await stripe.subscriptions.create({
//           customer: customer.id,

//           items: [
//             {
//               price: priceId,
//               quantity: 1,
//             },
//           ],

//           payment_behavior:
//             'default_incomplete',

//           payment_settings: {
//             save_default_payment_method:
//               'on_subscription',
//           },

//           metadata: {
//             userId,
//             plan,
//           },

//           expand: [
//             'latest_invoice',
//             'latest_invoice.payments',
//           ],
//         })

//       console.log(
//         'STRIPE SUBSCRIPTION CREATED:',
//         subscription.id
//       )

//       // ==================================================
//       // GET INVOICE
//       // ==================================================

//       const invoice =
//         subscription.latest_invoice

//       if (
//         !invoice ||
//         typeof invoice === 'string'
//       ) {
//         throw new Error(
//           'Stripe did not return the subscription invoice'
//         )
//       }

//       console.log(
//         'STRIPE INVOICE:',
//         JSON.stringify(
//           invoice,
//           null,
//           2
//         )
//       )

//       // ==================================================
//       // GET INVOICE PAYMENT
//       // ==================================================
//       const payments = invoice.payments?.data
//       if (!payments || payments.length === 0) {
//         throw new Error('Stripe did not return an invoice payment')
//       }
//       const paymentIntentId = payments[0].payment?.payment_intent
//       if (!paymentIntentId || typeof paymentIntentId !== 'string') {
//         throw new Error('Stripe did not return a payment intent')
//       }
//       console.log('PAYMENT INTENT:', paymentIntentId)
//       // ==================================================
//       // RETRIEVE PAYMENT INTENT
//       // ==================================================
//       const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
//       if (!paymentIntent.client_secret) {
//         throw new Error('Stripe payment intent has no client secret')
//       }
//       console.log('PAYMENT INTENT CLIENT SECRET:', paymentIntent.client_secret)
//       // ==================================================
//       // RETURN PAYMENT DATA
//       // ==================================================
//       return res.status(200).json({
//         clientSecret: paymentIntent.client_secret,
//         subscriptionId: subscription.id,
//         customerId: customer.id,
//       })
//     }


//   } catch (err: any) {
//     console.error('STRIPE ERROR:', err)
//     return res.status(400).json({
//       error:
//         err.message ||
//         'Stripe request failed',
//     })
//   }
// }


import Stripe from 'stripe'
import { setCorsHeaders } from './_cors'
import { prisma } from '../lib/db'
import jwt from 'jsonwebtoken'

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
  console.log(
    'STRIPE REQUEST:',
    req.method,
    req.headers.origin
  )

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

    // ==================================================
    // STRIPE WEBHOOK
    // ==================================================

    const signature = req.headers['stripe-signature']

    if (signature) {
      const event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

      console.log('STRIPE EVENT:', event.type)

      // ==================================================
      // SUBSCRIPTION UPDATED
      // ==================================================

      if (event.type === 'customer.subscription.updated') {
        const subscription =
          event.data.object as Stripe.Subscription

        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id

        const priceId =
          subscription.items.data[0]?.price.id

        console.log('SUBSCRIPTION UPDATED')
        console.log('Subscription:', subscription.id)
        console.log('Customer:', customerId)
        console.log('Price:', priceId)
        console.log(
          'Coach Price:',
          process.env.STRIPE_COACH_PRICE_ID
        )
        console.log(
          'Team Price:',
          process.env.STRIPE_TEAM_PRICE_ID
        )

        let plan: 'COACH' | 'TEAM'

        if (
          priceId ===
          process.env.STRIPE_COACH_PRICE_ID
        ) {
          plan = 'COACH'
        } else if (
          priceId ===
          process.env.STRIPE_TEAM_PRICE_ID
        ) {
          plan = 'TEAM'
        } else {
          console.error(
            'Unknown Stripe price:',
            priceId
          )

          return res.status(200).json({
            received: true,
          })
        }

        console.log(
          'PLAN DETERMINED FROM STRIPE:',
          plan
        )

        const updatedUser =
          await prisma.user.update({
            where: {
              stripeCustomerId: customerId,
            },
            data: {
              plan,
              stripeSubscriptionId:
                subscription.id,
            },
          })

        console.log(
          'USER PLAN UPDATED:',
          updatedUser.id,
          updatedUser.plan
        )
      }

      // ==================================================
      // PAYMENT SUCCESSFUL
      // ==================================================

      if (event.type === 'invoice.paid') {
        const invoice =
          event.data.object as Stripe.Invoice

        const subscription =
          invoice.parent
            ?.subscription_details
            ?.subscription

        const subscriptionId =
          typeof subscription === 'string'
            ? subscription
            : subscription?.id

        if (!subscriptionId) {
          throw new Error(
            'Missing subscription ID'
          )
        }

        const subscriptionData =
          await stripe.subscriptions.retrieve(
            subscriptionId
          )

        const userId =
          subscriptionData.metadata?.userId

        const customerId =
          typeof subscriptionData.customer === 'string'
            ? subscriptionData.customer
            : subscriptionData.customer?.id

        if (!userId) {
          throw new Error(
            'Missing userId in subscription metadata'
          )
        }

        if (!customerId) {
          throw new Error(
            'Missing Stripe customer'
          )
        }

        // -----------------------------------------------
        // DETERMINE PLAN FROM STRIPE PRICE
        // -----------------------------------------------

        const priceId =
          subscriptionData.items.data[0]?.price.id

        let plan: 'COACH' | 'TEAM'

        if (
          priceId ===
          process.env.STRIPE_COACH_PRICE_ID
        ) {
          plan = 'COACH'
        } else if (
          priceId ===
          process.env.STRIPE_TEAM_PRICE_ID
        ) {
          plan = 'TEAM'
        } else {
          throw new Error(
            `Unknown Stripe price: ${priceId}`
          )
        }

        console.log(
          'INVOICE PAID - STRIPE PLAN:',
          plan
        )

        // -----------------------------------------------
        // ACTIVATE / UPDATE USER
        // -----------------------------------------------

        const updatedUser =
          await prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              plan,

              subscriptionStatus:
                'ACTIVE',

              stripeCustomerId:
                customerId,

              stripeSubscriptionId:
                subscriptionId,
            },
          })

        console.log(
          'PLAYER ROUTES ACCOUNT UPDATED:',
          updatedUser.id,
          updatedUser.plan
        )

        // -----------------------------------------------
        // RECORD PAYMENT
        // -----------------------------------------------

        const amounts = {
          COACH: 600,
          TEAM: 1000,
        }

        const amount =
          amounts[plan]

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

              plan,

              status: 'PAID',

              stripePaymentId:
                invoice.id,

              paidAt: new Date(),
            },
          })
        }

        console.log(
          'PLAYER ROUTES PAYMENT RECORDED'
        )
      }

      // ==================================================
      // PAYMENT FAILED
      // ==================================================

      if (
        event.type ===
        'invoice.payment_failed'
      ) {
        const invoice =
          event.data.object as Stripe.Invoice

        const subscription =
          invoice.parent
            ?.subscription_details
            ?.subscription

        const subscriptionId =
          typeof subscription === 'string'
            ? subscription
            : subscription?.id

        if (subscriptionId) {
          const subscriptionData =
            await stripe.subscriptions.retrieve(
              subscriptionId
            )

          const userId =
            subscriptionData.metadata?.userId

          if (userId) {
            await prisma.user.update({
              where: {
                id: userId,
              },
              data: {
                subscriptionStatus:
                  'PAST_DUE',
              },
            })
          }
        }

        console.log(
          'STRIPE PAYMENT FAILED:',
          invoice.id
        )
      }

      // ==================================================
      // SUBSCRIPTION CANCELLED
      // ==================================================

      if (
        event.type ===
        'customer.subscription.deleted'
      ) {
        const subscription =
          event.data.object as Stripe.Subscription

        const userId =
          subscription.metadata?.userId

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

        console.log(
          'SUBSCRIPTION CANCELLED:',
          subscription.id
        )
      }

      return res.status(200).json({
        received: true,
      })
    }

    // ==================================================
    // FRONTEND REQUEST
    // ==================================================

    const body =
      JSON.parse(rawBody.toString())

    // ==================================================
    // MANAGE SUBSCRIPTION
    // ==================================================

    if (
      body.action ===
      'manage-subscription'
    ) {
      const authHeader =
        req.headers.authorization

      if (
        !authHeader ||
        !authHeader.startsWith('Bearer ')
      ) {
        return res.status(401).json({
          error:
            'Authentication required',
        })
      }

      const token =
        authHeader.split(' ')[1]

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as { userId: string }

      const userId =
        decoded.userId

      const user =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            stripeCustomerId: true,
          },
        })

      if (!user?.stripeCustomerId) {
        return res.status(400).json({
          error:
            'No Stripe customer found for this user',
        })
      }

      const session =
        await stripe.billingPortal.sessions.create({
          customer:
            user.stripeCustomerId,

          return_url:
            'https://playerroutes.com/profile',
        })

      return res.status(200).json({
        url: session.url,
      })
    }

    // ==================================================
    // CREATE SUBSCRIPTION
    // ==================================================

    if (
      body.action ===
      'create-subscription'
    ) {
      const {
        userId,
        plan,
      } = body

      const authHeader =
        req.headers.authorization

      if (
        !authHeader ||
        !authHeader.startsWith('Bearer ')
      ) {
        return res.status(401).json({
          error:
            'Authentication required',
        })
      }

      const token =
        authHeader.split(' ')[1]

      jwt.verify(
        token,
        process.env.JWT_SECRET!
      )

      // ==================================================
      // VALIDATE USER
      // ==================================================

      if (!userId || !plan) {
        return res.status(400).json({
          error:
            'User ID and plan are required',
        })
      }

      // ==================================================
      // VALIDATE PLAN
      // ==================================================

      if (
        !['COACH', 'TEAM'].includes(plan)
      ) {
        return res.status(400).json({
          error: 'Invalid plan',
        })
      }

      // ==================================================
      // GET STRIPE PRICE
      // ==================================================

      const prices = {
        COACH:
          process.env
            .STRIPE_COACH_PRICE_ID!,

        TEAM:
          process.env
            .STRIPE_TEAM_PRICE_ID!,
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
      // CREATE STRIPE CUSTOMER
      // ==================================================

      const customer =
        await stripe.customers.create({
          metadata: {
            userId,
          },
        })

      console.log(
        'STRIPE CUSTOMER CREATED:',
        customer.id
      )

      // ==================================================
      // CREATE STRIPE SUBSCRIPTION
      // ==================================================

      const subscription =
        await stripe.subscriptions.create({
          customer:
            customer.id,

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

          expand: [
            'latest_invoice',
            'latest_invoice.payments',
          ],
        })

      console.log(
        'STRIPE SUBSCRIPTION CREATED:',
        subscription.id
      )

      // ==================================================
      // GET INVOICE
      // ==================================================

      const invoice =
        subscription.latest_invoice

      if (
        !invoice ||
        typeof invoice === 'string'
      ) {
        throw new Error(
          'Stripe did not return the subscription invoice'
        )
      }

      console.log(
        'STRIPE INVOICE:',
        JSON.stringify(
          invoice,
          null,
          2
        )
      )

      // ==================================================
      // GET INVOICE PAYMENT
      // ==================================================

      const payments =
        invoice.payments?.data

      if (
        !payments ||
        payments.length === 0
      ) {
        throw new Error(
          'Stripe did not return an invoice payment'
        )
      }

      const paymentIntentId =
        payments[0].payment
          ?.payment_intent

      if (
        !paymentIntentId ||
        typeof paymentIntentId !== 'string'
      ) {
        throw new Error(
          'Stripe did not return a payment intent'
        )
      }

      console.log(
        'PAYMENT INTENT:',
        paymentIntentId
      )

      // ==================================================
      // RETRIEVE PAYMENT INTENT
      // ==================================================

      const paymentIntent =
        await stripe.paymentIntents.retrieve(
          paymentIntentId
        )

      if (
        !paymentIntent.client_secret
      ) {
        throw new Error(
          'Payment intent has no client secret'
        )
      }

      console.log(
        'PAYMENT INTENT CLIENT SECRET:',
        paymentIntent.client_secret
      )

      // ==================================================
      // RETURN PAYMENT DATA
      // ==================================================

      return res.status(200).json({
        clientSecret:
          paymentIntent.client_secret,

        subscriptionId:
          subscription.id,

        customerId:
          customer.id,
      })
    }

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