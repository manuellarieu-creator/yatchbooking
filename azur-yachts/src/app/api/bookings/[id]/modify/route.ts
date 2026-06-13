import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { newStart, newEnd, note } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
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

    // TODO: Transmettre notification à l'admin pour approbation
    // Pour cet exercice, on peut imaginer un email envoyé à l'admin ou une notification en DB

    return NextResponse.json({ success: true, message: 'Demande de modification envoyée avec succès.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
