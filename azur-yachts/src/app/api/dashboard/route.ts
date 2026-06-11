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

    // Ensure the user is an advertiser or admin
    if (role !== 'ADVERTISER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // 0. Fetch User explicitly
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
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

    // 2. Fetch bookings related to user's listings
    const bookings = await prisma.booking.findMany({
      where: { listingId: { in: listingIds } },
      include: {
        client: { select: { firstName: true, lastName: true, avatar: true } },
        listing: { select: { title: true, boatType: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Last 10 bookings
    })

    // 3. Compute stats
    let totalRevenue = 0
    let totalViews = 0
    let confirmedBookingsCount = 0

    listings.forEach(listing => {
      totalViews += listing.viewCount
    })

    bookings.forEach(booking => {
      if (['CONFIRMED', 'COMPLETED', 'PAYMENT_RECEIVED'].includes(booking.status)) {
        totalRevenue += booking.totalPrice
        confirmedBookingsCount++
      }
    })

    const occupancyRate = listings.length > 0 ? Math.round((confirmedBookingsCount / (listings.length * 4)) * 100) : 0 // Simplified mock formula for occupancy

    return NextResponse.json({
      user: {
        firstName: dbUser?.firstName || 'Utilisateur',
        lastName: dbUser?.lastName || '',
        tier: 'PREMIUM', // Mock for now, could be in DB
      },
      stats: {
        revenue: totalRevenue,
        views: totalViews,
        bookingsCount: bookings.length,
        occupancyRate: occupancyRate > 100 ? 100 : occupancyRate,
      },
      listings,
      bookings
    })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
