import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { yachtId } = await req.json();

    if (!yachtId) {
      return NextResponse.json({ error: 'yachtId manquant' }, { status: 400 });
    }

    const yacht = await prisma.listing.findUnique({
      where: { id: yachtId }
    });

    if (!yacht) {
      return NextResponse.json({ error: 'Bateau introuvable' }, { status: 404 });
    }

    if (!yacht.salePrice) {
      return NextResponse.json({ error: 'Bateau non disponible à la vente' }, { status: 400 });
    }

    // Créer une "Booking" spéciale pour représenter l'achat
    // totalNights = 0 permet d'identifier qu'il s'agit d'une vente
    const booking = await prisma.booking.create({
      data: {
        listingId: yacht.id,
        clientId: session.user.id as string,
        startDate: new Date(),
        endDate: new Date(),
        totalNights: 0, 
        basePrice: yacht.salePrice,
        cleaningFee: 0,
        securityDeposit: 0,
        totalPrice: yacht.salePrice,
        adults: 1,
        children: 0,
        status: 'PENDING',
        adminNote: 'ACHAT BATEAU',
      }
    });

    return NextResponse.json({ bookingId: booking.id });
  } catch (err: any) {
    console.error('Error in /api/sales/create:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
