import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const role = (session.user as any).role

    // Tous les utilisateurs peuvent accéder à ce dashboard, mais on cachera des sections dans l'UI selon le rôle
    // On ne bloque plus l'accès pour les CLIENTS


    // 0. Fetch User explicitly
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, videoVerified: true, role: true }
    })

    // 1. Fetch user's listings
    const listings = await prisma.listing.findMany({
      where: { ownerId: userId },
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        _count: { select: { bookings: true, reviews: true, favorites: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const listingIds = listings.map(l => l.id)

    // 2. Fetch bookings related to user's listings (all for stats) or client bookings
    let allBookings;
    if (dbUser?.role === 'CLIENT') {
      allBookings = await prisma.booking.findMany({
        where: { clientId: userId },
        include: {
          client: { select: { firstName: true, lastName: true, avatar: true } },
          listing: { select: { title: true, boatType: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      allBookings = await prisma.booking.findMany({
        where: { listingId: { in: listingIds } },
        include: {
          client: { select: { firstName: true, lastName: true, avatar: true } },
          listing: { select: { title: true, boatType: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    const bookings = allBookings.slice(0, 10); // Last 10 bookings for the table

    // 3. Compute stats
    let totalRevenue = 0
    let totalViews = 0
    let confirmedBookingsCount = 0
    let totalReviews = 0
    let sumOfRatings = 0

    const revenueByListingMap: Record<string, { title: string, revenue: number }> = {}
    
    listings.forEach(listing => {
      totalViews += listing.viewCount
      revenueByListingMap[listing.id] = { title: listing.title, revenue: 0 }
      totalReviews += listing.reviewCount
      sumOfRatings += (listing.averageRating || 0) * (listing.reviewCount || 0)
    })
    
    const averageRating = totalReviews > 0 ? Number((sumOfRatings / totalReviews).toFixed(1)) : 0;

    allBookings.forEach(booking => {
      if (['CONFIRMED', 'COMPLETED', 'PAYMENT_RECEIVED'].includes(booking.status)) {
        totalRevenue += booking.totalPrice
        confirmedBookingsCount++
        if (revenueByListingMap[booking.listingId]) {
          revenueByListingMap[booking.listingId].revenue += booking.totalPrice
        }
      }
    })

    const revenueByListing = Object.values(revenueByListingMap)
      .filter(item => item.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)

    const occupancyRate = listings.length > 0 ? Math.round((confirmedBookingsCount / (listings.length * 4)) * 100) : 0 // Simplified mock formula for occupancy

    const unreadNotifications = await prisma.notification.count({
      where: { userId: userId, isRead: false }
    })

    return NextResponse.json({
      user: {
        id: userId,
        firstName: dbUser?.firstName || 'Utilisateur',
        lastName: dbUser?.lastName || '',
        tier: 'PREMIUM', // Mock for now, could be in DB
        videoVerified: dbUser?.videoVerified || false,
        role: dbUser?.role,
        unreadNotifications,
      },
      stats: {
        revenue: totalRevenue,
        views: totalViews,
        bookingsCount: allBookings.length,
        occupancyRate: occupancyRate > 100 ? 100 : occupancyRate,
        averageRating,
        totalReviews,
        revenueByListing,
      },
      listings,
      bookings
    })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
