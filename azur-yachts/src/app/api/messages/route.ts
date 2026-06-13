import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { sendPushNotification } from '@/lib/webpush';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId manquant' }, { status: 400 });
    }

    if (userRole !== 'ADMIN') {
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
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
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
    const userRole = (session.user as any).role;
    const { conversationId, content, displayAsUserId } = await req.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (userRole !== 'ADMIN') {
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
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        conversationId,
        isAdminReply: userRole === 'ADMIN',
        displayAsUserId: userRole === 'ADMIN' ? displayAsUserId : null
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });

    // Mettre à jour l'updatedAt de la conversation
    const updatedConv = await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
      include: { participants: true }
    });

    // Notify other participants
    const notificationsToCreate = [];

    for (const p of updatedConv.participants) {
      if (p.userId !== userId) {
        notificationsToCreate.push({
          userId: p.userId,
          title: "Nouveau message",
          message: `Vous avez reçu un nouveau message de ${message.sender?.firstName || 'Quelqu\'un'}.`,
          type: "MESSAGE",
          link: `/dashboard`
        });

        sendPushNotification(
          p.userId,
          "Nouveau message",
          `Vous avez reçu un nouveau message de ${message.sender?.firstName || 'Quelqu\'un'}.`,
          `/dashboard` // or appropriate message center link
        );
      }
    }

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
