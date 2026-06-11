import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Récupérer toutes les conversations où l'utilisateur est participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Formater la réponse pour faciliter l'affichage
    const formattedConversations = conversations.map(conv => {
      // Trouver l'autre participant (pour afficher son nom/avatar)
      const otherParticipant = conv.participants.find(p => p.userId !== userId)?.user;
      
      return {
        id: conv.id,
        listingId: conv.listingId,
        listingTitle: conv.listingTitle,
        updatedAt: conv.updatedAt,
        otherUser: otherParticipant || { firstName: 'Utilisateur', lastName: 'Supprimé' },
        lastMessage: conv.messages.length > 0 ? conv.messages[0] : null,
        // Nombre de messages non lus (simplifié pour l'instant)
        unreadCount: 0 
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
