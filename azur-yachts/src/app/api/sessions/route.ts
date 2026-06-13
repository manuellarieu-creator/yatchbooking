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

    const sessions = await db.session.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Erreur GET /api/sessions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const currentSessionToken = (session as any).sessionToken;
    
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');

    if (sessionId) {
      // Delete specific session
      await db.session.deleteMany({
        where: { id: sessionId, userId }
      });
    } else {
      // Delete all other sessions
      if (currentSessionToken) {
        await db.session.deleteMany({
          where: { 
            userId,
            sessionToken: { not: currentSessionToken }
          }
        });
      } else {
        await db.session.deleteMany({ where: { userId } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/sessions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
