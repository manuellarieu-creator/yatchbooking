import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const userId = (session.user as any).id;
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId manquant' }, { status: 400 });
    }

    // Vérifier que l'utilisateur participe à la conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const userId = (session.user as any).id;
    const { conversationId, content } = await req.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier que l'utilisateur participe à la conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        conversationId
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    // Mettre à jour l'updatedAt de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
