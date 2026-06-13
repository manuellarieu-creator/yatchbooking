import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        videoVerified: true,
        advertiserTier: true,
        countryResidence: true,
        languages: true,
        createdAt: true,
        listings: {
          where: { status: 'ACTIVE' },
          select: {
            id: true, title: true, price: true, location: true, country: true,
            averageRating: true, reviewCount: true, images: { take: 1 }
          }
        },
        receivedReviews: {
          where: { targetType: 'OWNER' },
          include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
