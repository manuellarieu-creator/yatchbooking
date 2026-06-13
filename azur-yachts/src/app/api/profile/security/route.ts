import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id as string;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEmailEnabled: true,
        twoFactorSmsEnabled: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur GET /api/profile/security:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await req.json();

    const { twoFactorEmailEnabled, twoFactorSmsEnabled } = body;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        twoFactorEmailEnabled: twoFactorEmailEnabled !== undefined ? twoFactorEmailEnabled : undefined,
        twoFactorSmsEnabled: twoFactorSmsEnabled !== undefined ? twoFactorSmsEnabled : undefined,
      },
      select: {
        twoFactorEmailEnabled: true,
        twoFactorSmsEnabled: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur PUT /api/profile/security:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
