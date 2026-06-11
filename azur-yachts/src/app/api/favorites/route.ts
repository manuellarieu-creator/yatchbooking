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

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            location: true,
            boatType: true,
            maxAdults: true,
            maxChildren: true,
            averageRating: true,
            reviewCount: true,
            images: { take: 1, orderBy: { order: 'asc' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('GET /api/favorites error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json({ error: 'listingId est requis' }, { status: 400 })
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId
        }
      }
    })

    if (existingFavorite) {
      // S'il existe déjà, on le retire (Toggle)
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      })
      return NextResponse.json({ action: 'removed', success: true })
    } else {
      // Sinon on l'ajoute
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          listingId
        }
      })
      return NextResponse.json({ action: 'added', favorite }, { status: 201 })
    }

  } catch (error) {
    console.error('POST /api/favorites error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
