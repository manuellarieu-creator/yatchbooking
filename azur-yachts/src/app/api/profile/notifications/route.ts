import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    // On s'attend à recevoir un objet JSON avec les préférences
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: body,
      },
      select: {
        notificationPreferences: true,
      }
    });

    return NextResponse.json({ success: true, notificationPreferences: updatedUser.notificationPreferences });
  } catch (error) {
    console.error('PUT /api/profile/notifications error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
