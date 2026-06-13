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

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        languages: true,
        avatar: true,
        countryResidence: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { listings: true, bookings: true, favorites: true }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const unreadNotifications = await prisma.notification.count({
      where: { userId: userId, isRead: false }
    })

    const cancelledCount = await prisma.booking.count({
      where: {
        clientId: userId,
        status: 'CANCELLED'
      }
    })

    return NextResponse.json({ profile: { ...profile, unreadNotifications, cancelledCount } })
  } catch (error) {
    console.error('GET /api/users/profile error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    
    // On extrait uniquement les champs autorisés à la modification
    const { firstName, lastName, phone, bio, languages, avatar, countryResidence } = body

    // Validation basique (on s'assure que prénom et nom sont au moins fournis)
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Le prénom et le nom sont obligatoires' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone: phone !== undefined ? phone : null,
        bio: bio !== undefined ? bio : null,
        languages: Array.isArray(languages) ? languages : undefined,
        avatar: avatar !== undefined ? avatar : null,
        countryResidence: countryResidence !== undefined ? countryResidence : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        languages: true,
        avatar: true,
        countryResidence: true,
      }
    })

    return NextResponse.json({ profile: updatedUser })
  } catch (error) {
    console.error('PUT /api/users/profile error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
