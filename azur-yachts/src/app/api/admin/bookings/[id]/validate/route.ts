import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { emailBankTransferValidated, emailBankTransferRejected } from '@/lib/email';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { status, paymentStatus, reason } = await req.json();
    // status: 'CONFIRMED' | 'REJECTED'
    // paymentStatus: 'VERIFIED' | 'FAILED'
    // reason: optional text for rejection

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { payment: true, client: true, listing: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const updateData: any = {
      status
    };

    if (booking.payment) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: paymentStatus }
      });
    }

    await prisma.booking.update({
      where: { id: params.id },
      data: updateData
    });

    // Send emails
    const startStr = format(new Date(booking.startDate), 'dd MMM yyyy', { locale: fr });
    const endStr = format(new Date(booking.endDate), 'dd MMM yyyy', { locale: fr });

    if (status === 'CONFIRMED' && paymentStatus === 'VERIFIED') {
      await emailBankTransferValidated(
        booking.client.email,
        booking.client.firstName,
        booking.totalPrice,
        booking.listing.title,
        startStr,
        endStr
      );
    } else if (status === 'REJECTED' && paymentStatus === 'FAILED') {
      await emailBankTransferRejected(
        booking.client.email,
        booking.client.firstName,
        booking.listing.title,
        startStr,
        endStr,
        reason || 'Raison non spécifiée'
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
