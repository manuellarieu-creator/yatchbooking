import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ListingStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const location = searchParams.get('location') || ''
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')
    const type = searchParams.get('type') || ''
    const country = searchParams.get('country') || ''
    const priceMin = Number(searchParams.get('priceMin')) || 0
    const priceMax = Number(searchParams.get('priceMax')) || 999999
    const adults = Number(searchParams.get('adults')) || 0
    const captain = searchParams.get('captain')
    const skipper = searchParams.get('skipper')
    const rating = Number(searchParams.get('rating')) || 0
    const sort = searchParams.get('sort') || 'recent'
    const page = Number(searchParams.get('page')) || 1
    const limit = 12

    // Build where clause
    const where: any = {
      status: ListingStatus.ACTIVE,
      price: { gte: priceMin, lte: priceMax },
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
    if (rating > 0) where.averageRating = { gte: rating }

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
          owner: { select: { id: true, firstName: true, lastName: true, videoVerified: true, advertiserTier: true } },
          _count: { select: { reviews: true, bookings: true } },
        },
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({ listings, total, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('GET /api/listings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    if (session.user.role !== 'ADVERTISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title, description, price, country, location,
      latitude, longitude, maxAdults, maxChildren,
      boatType, boatLength, boatYear, requiresCaptain,
      skipperAvailable, maxRentalHours, deliveryAvailable,
      deliveryFee, cleaningFee, images, services, availabilities,
    } = body

    const listing = await prisma.listing.create({
      data: {
        title, description, price, country, location,
        latitude, longitude, maxAdults, maxChildren,
        boatType, boatLength, boatYear, requiresCaptain,
        skipperAvailable, maxRentalHours, deliveryAvailable,
        deliveryFee, cleaningFee,
        status: 'PENDING',
        ownerId: session.user.id,
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

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('POST /api/listings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
