import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { bookingId } = await req.json()

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, client: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (booking.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Create or retrieve payment intent
    let payment = await prisma.payment.findUnique({ where: { bookingId } })

    if (payment?.stripePaymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId)
      return NextResponse.json({ clientSecret: existing.client_secret })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: 'eur',
      metadata: {
        bookingId: booking.id,
        clientId: booking.clientId,
        listingTitle: booking.listing.title,
      },
    })

    if (!payment) {
      await prisma.payment.create({
        data: {
          amount: booking.totalPrice,
          currency: 'EUR',
          method: 'STRIPE',
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
          paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          bookingId: booking.id,
        },
      })
    } else {
      await prisma.payment.update({
        where: { bookingId },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
        },
      })
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Create intent error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
