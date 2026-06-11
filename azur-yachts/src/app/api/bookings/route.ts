import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'
import { calculateNights } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = (session.user as any).role
    const userId = (session.user as any).id
    const status = searchParams.get('status')
    
    // Si l'utilisateur est client, on récupère ses réservations.
    // Si l'utilisateur est annonceur, on récupère les réservations faites sur ses annonces.
    const where: any = {}
    
    if (role === 'ADVERTISER') {
      where.listing = { ownerId: userId }
    } else if (role === 'CLIENT') {
      where.clientId = userId
    } else if (role === 'ADMIN') {
      // L'admin voit tout (ou filtré si besoin)
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: { id: true, title: true, images: { take: 1, orderBy: { order: 'asc' } } }
        },
        client: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('GET /api/bookings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const {
      listingId, startDate, endDate, adults, children, pets,
      deliveryRequested, deliveryPort, selectedServicesIds // on attend un tableau d'IDs de services
    } = body

    if (!listingId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Vérifier l'annonce
    const listing = await prisma.listing.findUnique({
      where: { id: listingId, status: 'ACTIVE' },
      include: { services: true }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Annonce introuvable ou inactive' }, { status: 404 })
    }

    // Vérifier la capacité
    if (adults + children > listing.maxAdults + listing.maxChildren) {
      return NextResponse.json({ error: 'Capacité maximale dépassée' }, { status: 400 })
    }

    // Vérifier les chevauchements de réservations
    const overlapping = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['PENDING', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'CONFIRMED'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    })

    if (overlapping) {
      return NextResponse.json({ error: 'Ces dates ne sont plus disponibles' }, { status: 409 })
    }

    // Calculs
    const totalNights = calculateNights(start, end)
    if (totalNights <= 0) {
      return NextResponse.json({ error: 'Dates invalides' }, { status: 400 })
    }

    const basePrice = totalNights * listing.price
    const cleaningFee = listing.cleaningFee || 0
    const deliveryFee = deliveryRequested ? (listing.deliveryFee || 0) : 0
    
    // Calcul des services sélectionnés (validation côté serveur)
    let servicesTotal = 0
    const servicesToConnect: any[] = []
    
    if (Array.isArray(selectedServicesIds) && selectedServicesIds.length > 0) {
      const selectedDbServices = listing.services.filter(s => selectedServicesIds.includes(s.id))
      
      for (const svc of selectedDbServices) {
        // En MVP on suppose une quantité de 1 par service, ou calcul selon svc.unit (PER_BOOKING, PER_DAY)
        const svcPrice = svc.unit === 'PER_DAY' ? svc.price * totalNights : svc.price
        servicesTotal += svcPrice
        
        servicesToConnect.push({
          name: svc.name,
          price: svcPrice,
          unit: svc.unit
        })
      }
    }

    const totalPrice = basePrice + cleaningFee + deliveryFee + servicesTotal

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        listingId,
        clientId: (session.user as any).id,
        startDate: start,
        endDate: end,
        totalNights,
        basePrice,
        cleaningFee,
        deliveryFee,
        servicesTotal,
        totalPrice,
        adults: adults || 1,
        children: children || 0,
        pets: pets || false,
        deliveryRequested: deliveryRequested || false,
        deliveryPort,
        status: 'PENDING',
        selectedServices: {
          create: servicesToConnect
        }
      }
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('POST /api/bookings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
