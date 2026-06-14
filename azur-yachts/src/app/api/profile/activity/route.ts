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
    const userRole = (session.user as any).role;

    // ── 1. Réservations (client ou annonceur) ──
    const bookingWhere = userRole === 'ADVERTISER'
      ? { listing: { ownerId: userId } }
      : { clientId: userId };

    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        listing: { select: { title: true } },
        client: { select: { firstName: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 15,
    });

    // ── 2. Annonces publiées (annonceurs) ──
    const listings = userRole !== 'CLIENT'
      ? await prisma.listing.findMany({
          where: { ownerId: userId },
          select: { id: true, createdAt: true, title: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : [];

    // ── 3. Connexions récentes ──
    const sessions = await prisma.session.findMany({
      where: { userId },
      select: { id: true, lastActiveAt: true, deviceInfo: true, location: true },
      orderBy: { lastActiveAt: 'desc' },
      take: 5,
    });

    // ── 4. Avis déposés ──
    const reviews = await prisma.review.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        createdAt: true,
        rating: true,
        status: true,
        targetType: true,
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // ── 5. Paiements ──
    const payments = await prisma.payment.findMany({
      where: { booking: { clientId: userId } },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        booking: { select: { listing: { select: { title: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    // ── 6. Favoris ajoutés ──
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // ── Formatage et assemblage ──
    const activityLog: any[] = [];

    // Statut booking → libellé
    const bookingStatusLabel: Record<string, string> = {
      PENDING: 'en attente',
      PAYMENT_PENDING: 'en attente de paiement',
      PAYMENT_RECEIVED: 'paiement reçu',
      CONFIRMED: 'confirmée',
      REJECTED: 'refusée',
      CANCELLED: 'annulée',
      COMPLETED: 'terminée',
    };

    bookings.forEach(b => {
      const statusText = bookingStatusLabel[b.status] || b.status;
      // Activité de création
      activityLog.push({
        id: `booking-create-${b.id}`,
        type: 'BOOKING_CREATED',
        title: userRole === 'ADVERTISER'
          ? `Réservation reçue de ${b.client.firstName}`
          : 'Réservation créée',
        details: `${b.listing.title} · REF-${b.id.slice(-6).toUpperCase()}`,
        date: b.createdAt,
        icon: '📋',
      });
      // Si le statut a changé (updatedAt != createdAt)
      if (b.updatedAt.getTime() - b.createdAt.getTime() > 60000) {
        activityLog.push({
          id: `booking-status-${b.id}`,
          type: 'BOOKING_STATUS',
          title: `Réservation ${statusText}`,
          details: `${b.listing.title} · REF-${b.id.slice(-6).toUpperCase()}`,
          date: b.updatedAt,
          icon: b.status === 'CONFIRMED' ? '✅' : b.status === 'CANCELLED' ? '❌' : '🔄',
        });
      }
    });

    listings.forEach(l => {
      const statusLabel = l.status === 'ACTIVE' ? 'publiée' : l.status === 'REJECTED' ? 'refusée' : 'en attente';
      activityLog.push({
        id: `listing-${l.id}`,
        type: 'LISTING_CREATED',
        title: `Annonce ${statusLabel}`,
        details: l.title,
        date: l.createdAt,
        icon: '⚓',
      });
    });

    sessions.forEach(s => {
      activityLog.push({
        id: `session-${s.id}`,
        type: 'LOGIN',
        title: 'Connexion détectée',
        details: `${s.deviceInfo || 'Appareil inconnu'} · ${s.location || 'Localisation inconnue'}`,
        date: s.lastActiveAt,
        icon: '🔑',
      });
    });

    reviews.forEach(r => {
      const target = r.targetType === 'LISTING' && r.listing
        ? r.listing.title
        : r.targetType === 'SITE' ? 'Azur Yachts' : 'un propriétaire';
      const statusLabel = r.status === 'APPROVED' ? '' : r.status === 'REJECTED' ? ' (refusé)' : ' (en attente)';
      activityLog.push({
        id: `review-${r.id}`,
        type: 'REVIEW_POSTED',
        title: `Avis déposé${statusLabel}`,
        details: `${target} · ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}`,
        date: r.createdAt,
        icon: '⭐',
      });
    });

    const paymentMethodLabel: Record<string, string> = {
      STRIPE: 'Carte bancaire',
      BANK_TRANSFER: 'Virement bancaire',
      PAYPAL: 'PayPal',
    };
    const paymentStatusLabel: Record<string, string> = {
      PENDING: 'en attente',
      AWAITING_PROOF: 'en attente de preuve',
      PROOF_SUBMITTED: 'preuve soumise',
      VERIFIED: 'vérifié',
      FAILED: 'échoué',
      REFUNDED: 'remboursé',
    };

    payments.forEach(p => {
      activityLog.push({
        id: `payment-${p.id}`,
        type: 'PAYMENT',
        title: `Paiement ${paymentStatusLabel[p.status] || p.status}`,
        details: `${p.booking.listing.title} · €${p.amount.toLocaleString('fr-FR')} · ${paymentMethodLabel[p.method] || p.method}`,
        date: p.updatedAt,
        icon: '💳',
      });
    });

    favorites.forEach(f => {
      activityLog.push({
        id: `fav-${f.id}`,
        type: 'FAVORITE_ADDED',
        title: 'Ajouté aux favoris',
        details: f.listing.title,
        date: f.createdAt,
        icon: '❤️',
      });
    });

    // Tri chronologique décroissant
    activityLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Retourner les 30 événements les plus récents
    return NextResponse.json({ activity: activityLog.slice(0, 30) });
  } catch (error) {
    console.error('GET /api/profile/activity error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
