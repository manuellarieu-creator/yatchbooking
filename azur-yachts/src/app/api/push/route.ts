import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { endpoint, keys } = await req.json();

    if (!endpoint || !keys) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Upsert subscription
    await db.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      update: {
        userId,
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur POST /api/push:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint manquant' }, { status: 400 });
    }

    await db.pushSubscription.deleteMany({
      where: { endpoint }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/push:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
