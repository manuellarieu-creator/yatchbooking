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

    // Fetch different types of activity
    const bookings = await prisma.booking.findMany({
      where: { clientId: userId },
      select: { id: true, createdAt: true, listing: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const listings = await prisma.listing.findMany({
      where: { ownerId: userId },
      select: { id: true, createdAt: true, title: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const sessions = await prisma.session.findMany({
      where: { userId },
      select: { id: true, lastActiveAt: true, deviceInfo: true, location: true },
      orderBy: { lastActiveAt: 'desc' },
      take: 5,
    });

    // Format and combine
    const activityLog: any[] = [];

    bookings.forEach(b => {
      activityLog.push({
        id: `booking-${b.id}`,
        type: 'BOOKING_CREATED',
        title: 'Réservation créée',
        details: `${b.listing.title} — REF-${b.id.slice(-6).toUpperCase()}`,
        date: b.createdAt,
      });
    });

    listings.forEach(l => {
      activityLog.push({
        id: `listing-${l.id}`,
        type: 'LISTING_CREATED',
        title: 'Annonce publiée',
        details: l.title,
        date: l.createdAt,
      });
    });

    sessions.forEach(s => {
      activityLog.push({
        id: `session-${s.id}`,
        type: 'LOGIN',
        title: 'Connexion détectée',
        details: `${s.deviceInfo || 'Appareil inconnu'} · ${s.location || 'Localisation inconnue'}`,
        date: s.lastActiveAt,
      });
    });

    // Sort by date descending
    activityLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return the top 20 events
    return NextResponse.json({ activity: activityLog.slice(0, 20) });
  } catch (error) {
    console.error('GET /api/profile/activity error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
