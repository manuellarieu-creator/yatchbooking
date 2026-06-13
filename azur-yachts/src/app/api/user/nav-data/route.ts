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

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, videoVerified: true, role: true }
    });

    const listingsCount = await prisma.listing.count({ where: { ownerId: userId } });
    const pendingBookingsCount = await prisma.booking.count({ 
      where: { 
        listing: { ownerId: userId },
        OR: [
          { status: 'PENDING' },
          { payment: { status: 'PROOF_SUBMITTED' } }
        ]
      }
    });

    const unreadNotifications = await prisma.notification.count({
      where: { userId: userId, isRead: false }
    });

    return NextResponse.json({
      user: {
        firstName: dbUser?.firstName || 'Utilisateur',
        lastName: dbUser?.lastName || '',
        videoVerified: dbUser?.videoVerified || false,
        role: dbUser?.role,
        unreadNotifications,
      },
      listingsCount,
      pendingBookingsCount
    });
  } catch (error) {
    console.error('GET /api/user/nav-data error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
