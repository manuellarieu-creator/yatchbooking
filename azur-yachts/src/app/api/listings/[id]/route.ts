import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        services: true,
        availabilities: true,
        owner: {
          select: {
            id: true, firstName: true, lastName: true,
            avatar: true, videoVerified: true, advertiserTier: true,
            languages: true, createdAt: true, role: true,
            receivedReviews: {
              where: { targetType: 'OWNER' },
              include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          },
        },
        reviews: {
          where: { targetType: 'LISTING' },
          include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, bookings: true, favorites: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 })
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    // Compute owner stats
    let ownerAverageRating = 0;
    let ownerReviewCount = 0;
    if (listing.ownerId) {
      const agg = await prisma.review.aggregate({
        where: { targetUserId: listing.ownerId, targetType: 'OWNER', status: 'APPROVED' },
        _avg: { rating: true },
        _count: true
      });
      ownerAverageRating = agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : 0;
      ownerReviewCount = agg._count || 0;
    }
    
    // Attach to owner object
    if (listing.owner) {
      (listing.owner as any).averageRating = ownerAverageRating;
      (listing.owner as any).reviewCount = ownerReviewCount;
    }

    // Fetch similar listings
    const similar = await prisma.listing.findMany({
      where: {
        id: { not: params.id },
        status: 'ACTIVE'
      },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 }
      },
      take: 4,
    });

    return NextResponse.json({ listing, similar })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const PUT = auth(async (req: any, { params }: any) => {
  try {
    const session = req.auth
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

    if (listing.ownerId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const { images, services, availabilities, ownerId, ...data } = body;

    if (ownerId && (session.user as any).role === 'ADMIN') {
      data.ownerId = ownerId;
    }

    if ('cabins' in data) data.cabins = data.cabins ? Number(data.cabins) : null;
    if ('berths' in data) data.berths = data.berths ? Number(data.berths) : null;
    if ('bathrooms' in data) data.bathrooms = data.bathrooms ? Number(data.bathrooms) : null;
    if ('salePrice' in data) data.salePrice = data.salePrice ? Number(data.salePrice) : null;
    if ('trialPrice' in data) data.trialPrice = data.trialPrice ? Number(data.trialPrice) : null;
    if ('saleOfferType' in data) data.saleOfferType = data.saleOfferType || null;
    
    if ('navigationMode' in data) data.navigationMode = String(data.navigationMode);
    if ('fuelQuantity' in data) data.fuelQuantity = data.fuelQuantity ? String(data.fuelQuantity) : null;
    if ('fuelPricePerDay' in data) data.fuelPricePerDay = data.fuelPricePerDay ? Number(data.fuelPricePerDay) : null;
    if ('requiresLicense' in data) data.requiresLicense = Boolean(data.requiresLicense);
    if ('enginePower' in data) data.enginePower = data.enginePower ? Number(data.enginePower) : null;

    if (images) {
      data.images = {
        deleteMany: {},
        create: images.map((img: any, idx: number) => ({
          url: img.url,
          publicId: img.publicId,
          order: idx + 1,
        }))
      };
    }
    if (services) {
      data.services = {
        deleteMany: {},
        create: services.map((svc: any) => ({
          name: svc.name,
          price: svc.price,
          unit: svc.unit,
          description: svc.description,
          isRequired: svc.isRequired || false,
        }))
      };
    }

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: { ...data, status: (session.user as any).role === 'ADMIN' ? data.status || listing.status : 'PENDING' },
    })

    return NextResponse.json({ listing: updated })
  } catch (error: any) {
    console.error('Error updating listing:', error);
    const msg = error?.message || 'Erreur serveur';
    const lines = msg.split('\n');
    const reason = lines.slice(-5).join('\n');
    return NextResponse.json({ error: reason }, { status: 500 })
  }
})

export const DELETE = auth(async (req: any, { params }: any) => {
  try {
    const session = req.auth
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

    if (listing.ownerId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    await prisma.listing.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
})
