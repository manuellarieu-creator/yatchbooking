import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'
import { sendNewListingAdmin } from '@/lib/resend'
import { ListingStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const location = searchParams.get('location') || ''
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')
    const type = searchParams.get('type') || ''
    const country = searchParams.get('country') || ''
    const forSale = searchParams.get('forSale') === 'true'
    const priceMin = Number(searchParams.get('priceMin')) || 0
    const priceMax = Number(searchParams.get('priceMax')) || 999999
    const adults = Number(searchParams.get('adults')) || 0
    const captain = searchParams.get('captain')
    const skipper = searchParams.get('skipper')
    const requiresLicense = searchParams.get('requiresLicense')
    const rating = Number(searchParams.get('rating')) || 0
    const sort = searchParams.get('sort') || 'recent'
    const page = Number(searchParams.get('page')) || 1
    const limit = 12

    // Build where clause
    const where: any = {
      status: ListingStatus.ACTIVE,
      price: { gte: priceMin, lte: priceMax },
    }

    if (forSale) {
      where.salePrice = { not: null }
    }

    if (location) {
      where.OR = [
        { location: { contains: location, mode: 'insensitive' } },
        { country: { contains: location, mode: 'insensitive' } },
      ]
    }
    if (type) where.boatType = { contains: type, mode: 'insensitive' }
    if (country) where.country = { contains: country, mode: 'insensitive' }
    if (adults > 0) where.maxAdults = { gte: adults }
    if (captain === 'oui') where.requiresCaptain = true
    if (captain === 'non') where.requiresCaptain = false
    if (skipper === 'oui') where.skipperAvailable = true
    if (skipper === 'non') where.skipperAvailable = false
    if (requiresLicense === 'false') where.requiresLicense = false
    if (rating > 0) where.averageRating = { gte: rating }

    const saleOfferType = searchParams.get('saleOfferType')
    if (saleOfferType) where.saleOfferType = saleOfferType

    // Date availability filter
    if (dateStart && dateEnd) {
      const start = new Date(dateStart)
      const end = new Date(dateEnd)
      where.NOT = {
        bookings: {
          some: {
            status: { in: ['PENDING', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'CONFIRMED'] },
            OR: [
              { startDate: { lte: end }, endDate: { gte: start } },
            ],
          },
        },
      }
    }

    // Sort
    const orderBy: any = sort === 'price-asc' ? { price: 'asc' }
      : sort === 'price-desc' ? { price: 'desc' }
      : sort === 'rating' ? { averageRating: 'desc' }
      : sort === 'popular' ? { viewCount: 'desc' }
      : { createdAt: 'desc' }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          owner: { select: { id: true, firstName: true, lastName: true, videoVerified: true, advertiserTier: true, avatar: true } },
          _count: { select: { reviews: true, bookings: true } },
        },
      }),
      prisma.listing.count({ where }),
    ])

    // Fetch user favorites if logged in
    const session = await auth()
    let userFavorites: string[] = []
    if (session?.user) {
      const favs = await prisma.favorite.findMany({
        where: { userId: (session.user as any).id },
        select: { listingId: true }
      })
      userFavorites = favs.map(f => f.listingId)
    }

    const mappedListings = listings.map((l) => ({
      ...l,
      boatYear: l.boatYear,
      boatLength: l.boatLength,
      saleOfferType: l.saleOfferType,
      isFav: userFavorites.includes(l.id)
    }))

    return NextResponse.json({ listings: mappedListings, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('GET /api/listings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export const POST = auth(async (req: any) => {
  try {
    const session = req.auth
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    if ((session.user as any).role !== 'ADVERTISER' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title, description, price, salePrice, trialPrice, saleOfferType, country, location,
      latitude, longitude, maxAdults, maxChildren,
      boatType, boatLength, boatYear, cabins, berths, bathrooms, boatPlanUrls, requiresCaptain,
      skipperAvailable, requiresLicense, enginePower, maxRentalHours, deliveryAvailable, fuelIncluded, captainPrice, skipperPrice,
      deliveryFee, deliveryPricing, features, cleaningFee, securityDeposit, images, services, availabilities, ownerId,
      navigationMode, fuelQuantity, fuelPricePerDay
    } = body

    const finalOwnerId = ((session.user as any).role === 'ADMIN' && ownerId) ? ownerId : (session.user as any).id;

    const listing = await prisma.listing.create({
      data: {
        title, description, price, salePrice: salePrice ? Number(salePrice) : null, trialPrice: trialPrice ? Number(trialPrice) : null, saleOfferType: saleOfferType || null, country, location,
        latitude, longitude, maxAdults, maxChildren,
        boatType, boatLength, boatYear, 
        navigationMode,
        fuelQuantity,
        fuelPricePerDay: fuelPricePerDay ? Number(fuelPricePerDay) : null,
        cabins: cabins ? Number(cabins) : null, 
        berths: berths ? Number(berths) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        boatPlanUrls: boatPlanUrls || [],
        requiresCaptain,
        skipperAvailable,
        requiresLicense: requiresLicense !== undefined ? requiresLicense : true,
        enginePower: enginePower ? Number(enginePower) : null,
        maxRentalHours, deliveryAvailable, fuelIncluded, captainPrice, skipperPrice,
        deliveryFee, deliveryPricing, features: features || [], cleaningFee, securityDeposit: securityDeposit || 0,
        status: (session.user as any).role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
        ownerId: finalOwnerId,
        images: {
          create: images?.map((img: any, idx: number) => ({
            url: img.url,
            publicId: img.publicId,
            order: idx + 1,
          })) || [],
        },
        services: {
          create: services?.map((svc: any) => ({
            name: svc.name,
            price: svc.price,
            unit: svc.unit,
            description: svc.description,
            isRequired: svc.isRequired || false,
          })) || [],
        },
        availabilities: {
          create: availabilities?.map((avail: any) => ({
            startDate: new Date(avail.startDate),
            endDate: new Date(avail.endDate),
            type: avail.type || 'AVAILABLE',
          })) || [],
        },
      },
      include: { images: true, services: true },
    })

    // Notify admin if the listing is pending
    if (listing.status === 'PENDING') {
      const advertiserName = (session.user as any).firstName 
        ? `${(session.user as any).firstName} ${(session.user as any).lastName || ''}`
        : (session.user as any).email;
        
      await sendNewListingAdmin(
        process.env.ADMIN_EMAIL || 'admin@voyyacht.vercel.app',
        advertiserName,
        listing.title,
        listing.id
      )
    }

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('POST /api/listings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
})
