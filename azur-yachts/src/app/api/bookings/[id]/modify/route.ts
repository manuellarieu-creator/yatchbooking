import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { sendPushNotification } from '@/lib/webpush';
import { shouldNotify } from '@/lib/notifications';
import { NotificationType } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { newStart, newEnd, note } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        listing: { select: { title: true } },
        client: { select: { firstName: true, lastName: true } }
      }
    });

    if (!booking || booking.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Réservation introuvable ou non autorisée' }, { status: 404 });
    }

    // Dans un vrai système on vérifierait la disponibilité avec `newStart` et `newEnd`.
    // Si la modification = true -> 40€ supplémentaires si available_date = true.
    const isAvailable = true; // Simulé pour l'instant

    if (!isAvailable) {
      return NextResponse.json({ error: 'Ces dates ne sont pas disponibles.' }, { status: 400 });
    }

    await prisma.booking.update({
      where: { id: params.id },
      data: {
        requestedStartDate: new Date(newStart),
        requestedEndDate: new Date(newEnd),
        requestedNote: note,
        modificationFee: 40,
        modificationStatus: 'PENDING_APPROVAL'
      }
    });

    // Notification aux admins pour approbation
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    const notificationsToCreate: { userId: string; title: string; body: string; type: NotificationType; link: string }[] = [];

    for (const admin of admins) {
      notificationsToCreate.push({
        userId: admin.id,
        title: "Demande de modification",
        body: `${booking.client.firstName} a demandé à modifier la réservation REF-${booking.id.slice(-6).toUpperCase()} (${booking.listing.title}).`,
        type: "BOOKING_NEW",
        link: `/admin/bookings`
      });

      // Push conditionné par préférences
      if (await shouldNotify(admin.id, 'BOOKING_NEW', 'push')) {
        sendPushNotification(
          admin.id,
          "Demande de modification",
          `${booking.client.firstName} souhaite modifier la réservation pour ${booking.listing.title}.`,
          `/admin/bookings`
        );
      }
    }

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate
      });
    }

    return NextResponse.json({ success: true, message: 'Demande de modification envoyée avec succès.' });
  } catch (error) {
    console.error('Modify booking error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
