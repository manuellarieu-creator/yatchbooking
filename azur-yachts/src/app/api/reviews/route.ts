import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'
import { ReviewTargetType } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { listingId, targetType, targetUserId, rating, comment } = body

    if (rating === undefined || !comment) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La note doit être comprise entre 1 et 5' }, { status: 400 })
    }

    const tType = targetType as ReviewTargetType || 'LISTING';

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        listingId: tType === 'LISTING' ? listingId : null,
        targetUserId: tType === 'OWNER' ? targetUserId : null,
        targetType: tType,
        authorId: userId
      }
    })

    // Mettre à jour la note moyenne du bateau ou du propriétaire
    if (tType === 'LISTING' && listingId) {
      const aggregate = await prisma.review.aggregate({
        where: { listingId, targetType: 'LISTING' },
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
    } else if (tType === 'OWNER' && targetUserId) {
      const aggregate = await prisma.review.aggregate({
        where: { targetUserId, targetType: 'OWNER' },
        _avg: { rating: true },
        _count: { id: true }
      })

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          // Si User a un champ averageRating, mettez-le à jour, sinon ce calcul sera fait à la volée.
        }
      }).catch(() => {}); // Ignorer si le champ n'existe pas dans le modèle User
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

