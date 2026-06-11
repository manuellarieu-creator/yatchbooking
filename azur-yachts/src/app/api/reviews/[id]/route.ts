import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    const review = await prisma.review.findUnique({
      where: { id: params.id }
    })

    if (!review) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })
    }

    if (review.authorId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    await prisma.review.delete({
      where: { id: params.id }
    })

    // Mettre à jour la note moyenne du bateau après suppression
    const aggregate = await prisma.review.aggregate({
      where: { listingId: review.listingId },
      _avg: { rating: true },
      _count: { id: true }
    })

    await prisma.listing.update({
      where: { id: review.listingId },
      data: {
        averageRating: aggregate._avg.rating || 0,
        reviewCount: aggregate._count.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/reviews/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
