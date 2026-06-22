import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const userId = (session.user as any).id;
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Aucun administrateur disponible' }, { status: 404 });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        listingTitle: 'Support Client',
        participants: {
          every: {
            userId: { in: [userId, adminUser.id] }
          }
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { role: true, firstName: true } } }
        }
      }
    });

    return NextResponse.json({ conversation: existing });
  } catch (error) {
    console.error('GET /api/conversations/support error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Find an Admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Aucun administrateur disponible pour le support' }, { status: 404 });
    }

    // Check if a support conversation already exists for this user
    const existing = await prisma.conversation.findFirst({
      where: {
        listingTitle: 'Support Client',
        participants: {
          every: {
            userId: { in: [userId, adminUser.id] }
          }
        }
      }
    });

    if (existing) {
      return NextResponse.json({ conversation: existing });
    }

    // Create a new support conversation
    const newConv = await prisma.conversation.create({
      data: {
        listingTitle: 'Support Client',
        participants: {
          create: [
            { userId: userId },
            { userId: adminUser.id }
          ]
        }
      }
    });

    return NextResponse.json({ conversation: newConv });
  } catch (error) {
    console.error('POST /api/conversations/support error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
