import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import Stripe from 'stripe'
import { sendBookingConfirmation } from '@/lib/resend'
import { shouldNotify } from '@/lib/notifications'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const bookingId = paymentIntent.metadata.bookingId

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, listing: true },
    })

    if (booking) {
      await prisma.payment.update({
        where: { bookingId },
        data: { status: 'VERIFIED' },
      })
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'PAYMENT_RECEIVED' },
      })
      // Envoi de l'email de confirmation — conditionné par préférences
      if (await shouldNotify(booking.clientId, 'BOOKING_CONFIRMED', 'email')) {
        await sendBookingConfirmation(
          booking.client.email,
          booking.client.firstName,
          bookingId,
          booking.listing.title,
          booking.startDate.toLocaleDateString('fr-FR'),
          booking.endDate.toLocaleDateString('fr-FR'),
          booking.totalPrice
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
