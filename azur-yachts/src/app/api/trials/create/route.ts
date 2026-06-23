import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { yachtId, date, deliveryFee, portName } = await req.json();

    if (!yachtId || !date) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const yacht = await prisma.listing.findUnique({
      where: { id: yachtId }
    });

    if (!yacht) {
      return NextResponse.json({ error: 'Bateau introuvable' }, { status: 404 });
    }

    if (!yacht.trialPrice) {
      return NextResponse.json({ error: 'Essai non disponible pour ce bateau' }, { status: 400 });
    }

    const basePrice = yacht.trialPrice;
    const finalDeliveryFee = Number(deliveryFee) || 0;
    const totalPrice = basePrice + finalDeliveryFee;

    const trialDate = new Date(date);

    // Créer une réservation spéciale pour l'essai
    // totalNights = 0
    const booking = await prisma.booking.create({
      data: {
        listingId: yacht.id,
        clientId: session.user.id,
        startDate: trialDate,
        endDate: trialDate,
        totalNights: 0, 
        basePrice: basePrice,
        cleaningFee: 0,
        securityDeposit: 0,
        deliveryFee: finalDeliveryFee,
        totalPrice: totalPrice,
        adults: 1,
        children: 0,
        status: 'PENDING',
        adminNote: `ESSAI BATEAU - ${portName}`,
      }
    });

    return NextResponse.json({ bookingId: booking.id });
  } catch (err: any) {
    console.error('Error in /api/trials/create:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
