import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';
import { sendPushNotification } from '@/lib/webpush';
import { shouldNotify } from '@/lib/notifications';
import { emailNewMessage } from '@/lib/email';

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

    // Determine the sender name to display
    let senderName = message.sender?.firstName || 'Quelqu\'un';
    if (message.isAdminReply && message.displayAsUserId) {
      const displayUser = await prisma.user.findUnique({ where: { id: message.displayAsUserId }, select: { firstName: true } });
      if (displayUser) {
        senderName = displayUser.firstName;
      }
    }

    // Notify other participants
    const notificationsToCreate: any[] = [];
    // @ts-expect-error global.io is set by the custom server
    const io = global.io;

    for (const p of updatedConv.participants) {
      if (p.userId !== userId) {
        const notifData = {
          userId: p.userId,
          title: "Nouveau message",
          body: `Vous avez reçu un nouveau message de ${senderName}.`,
          type: "NEW_MESSAGE",
          link: `/dashboard?tab=messages`
        };
        notificationsToCreate.push(notifData);

        if (io) {
          io.to(p.userId).emit('new_message', message);
          io.to(p.userId).emit('new_notification', notifData);
        }

        // Push conditionné par préférences
        if (await shouldNotify(p.userId, 'NEW_MESSAGE', 'push')) {
          sendPushNotification(
            p.userId,
            "Nouveau message",
            `Vous avez reçu un nouveau message de ${senderName}.`,
            `/dashboard?tab=messages`
          );
        }
        
        // Email conditionné par préférences
        if (await shouldNotify(p.userId, 'NEW_MESSAGE', 'email')) {
          const userObj = await prisma.user.findUnique({ where: { id: p.userId }, select: { email: true, firstName: true } });
          if (userObj?.email) {
            await emailNewMessage(
              userObj.email,
              userObj.firstName || 'Client',
              senderName,
              content.length > 50 ? content.substring(0, 50) + '...' : content
            );
          }
        }
      }
    }

    // Notify the admins (if they are not participants)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      // Check if admin is already a participant
      const isParticipant = updatedConv.participants.some(p => p.userId === admin.id);
      if (!isParticipant) {
        const adminNotifData = {
          userId: admin.id,
          title: "Nouveau message (Admin)",
          body: `Un nouveau message a été envoyé par ${senderName}.`,
          type: "NEW_MESSAGE",
          link: `/admin/messages`
        };
        notificationsToCreate.push(adminNotifData);

        if (io) {
          io.to(admin.id).emit('new_message', message);
          io.to(admin.id).emit('new_notification', adminNotifData);
        }

        // Push conditionné par préférences
        if (await shouldNotify(admin.id, 'NEW_MESSAGE', 'push')) {
          sendPushNotification(
            admin.id,
            "Nouveau message (Admin)",
            `Un nouveau message a été envoyé par ${senderName}.`,
            `/admin/messages`
          );
        }
        
        // Email conditionné par préférences
        if (await shouldNotify(admin.id, 'NEW_MESSAGE', 'email')) {
          await emailNewMessage(
            admin.email,
            admin.firstName || 'Admin',
            senderName,
            content.length > 50 ? content.substring(0, 50) + '...' : content
          );
        }
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
