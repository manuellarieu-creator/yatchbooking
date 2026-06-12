import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      include: {
        participants: {
          include: {
            user: {
              select: { 
                id: true, firstName: true, lastName: true, avatar: true, role: true,
                email: true, phone: true, languages: true, countryResidence: true, advertiserTier: true, isManagedByAdmin: true,
                listings: {
                  select: { averageRating: true }
                }
              }
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

    const formattedConversations = conversations.map(conv => {
      // Find the client and the advertiser
      const client = conv.participants.find(p => p.user.role === 'CLIENT')?.user;
      const rawAdvertiser = conv.participants.find(p => p.user.role === 'ADVERTISER')?.user;
      
      let advertiser = null;
      if (rawAdvertiser) {
        let advertiserRating = 0;
        if (rawAdvertiser.listings && rawAdvertiser.listings.length > 0) {
          const total = rawAdvertiser.listings.reduce((acc, l) => acc + (l.averageRating || 0), 0);
          advertiserRating = parseFloat((total / rawAdvertiser.listings.length).toFixed(1));
        }
        advertiser = {
          ...rawAdvertiser,
          averageRating: advertiserRating
        };
      }
      
      return {
        id: conv.id,
        listingId: conv.listingId,
        listingTitle: conv.listingTitle,
        updatedAt: conv.updatedAt,
        client: client || { firstName: 'Client', lastName: 'Inconnu' },
        advertiser: advertiser || null,
        lastMessage: conv.messages.length > 0 ? conv.messages[0] : null,
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('GET /api/admin/conversations error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
