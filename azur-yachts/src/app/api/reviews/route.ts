import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { listingId, rating, comment } = body

    if (!listingId || rating === undefined || !comment) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La note doit être comprise entre 1 et 5' }, { status: 400 })
    }

    // Vérifier si l'utilisateur a bien loué ce bateau
    const pastBooking = await prisma.booking.findFirst({
      where: {
        clientId: userId,
        listingId,
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        endDate: { lte: new Date() } // La location doit être passée
      }
    })

    if (!pastBooking) {
      return NextResponse.json({ error: 'Vous devez avoir loué ce bateau pour laisser un avis' }, { status: 403 })
    }

    // Vérifier s'il a déjà laissé un avis
    const existingReview = await prisma.review.findFirst({
      where: { authorId: userId, listingId }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour ce bateau' }, { status: 409 })
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        listingId,
        authorId: userId
      }
    })

    // Mettre à jour la note moyenne du bateau
    const aggregate = await prisma.review.aggregate({
      where: { listingId },
      _avg: { rating: true },
      _count: { id: true }
    })

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        averageRating: aggregate._avg.rating || 0,
        reviewCount: aggregate._count.id
      }
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
