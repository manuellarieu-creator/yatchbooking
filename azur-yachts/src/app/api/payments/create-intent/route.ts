import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-05-27.dahlia', // Use the latest compatible version expected by types
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ message: 'bookingId manquant' }, { status: 400 });
    }

    // Fetch the booking and verify ownership
    let amountInCents = 34200 * 100; // default for mock

    if (bookingId !== 'mock') {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: {
          listing: true,
        },
      });

      if (!booking) {
        return NextResponse.json({ message: 'Réservation introuvable' }, { status: 404 });
      }

      if (booking.clientId !== (session.user as any).id) {
        return NextResponse.json({ message: 'Non autorisé pour cette réservation' }, { status: 403 });
      }

      amountInCents = Math.round(booking.totalPrice * 100);
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      // In the latest api, automatic_payment_methods is recommended
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: bookingId,
        clientId: (session.user as any).id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Erreur Stripe Create Intent:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du paiement', error: error.message },
      { status: 500 }
    );
  }
}
