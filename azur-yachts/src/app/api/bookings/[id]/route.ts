import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'
import { BookingStatus } from '@prisma/client'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        listing: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true, phone: true } },
            images: { take: 1, orderBy: { order: 'asc' } }
          }
        },
        client: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        selectedServices: true,
        payment: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    // Autorisation : Client, Propriétaire, ou Admin
    if (booking.clientId !== userId && booking.listing.ownerId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('GET /api/bookings/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { status, adminNote } = body
    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { listing: { select: { ownerId: true } } }
    })

    if (!booking) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

    const isClient = booking.clientId === userId
    const isOwner = booking.listing.ownerId === userId
    const isAdmin = userRole === 'ADMIN'

    if (!isClient && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Règles de modification de statut :
    // Client peut annuler (CANCELLED) s'il n'est pas encore confirmé/terminé
    // Owner peut accepter/rejeter
    let newStatus = booking.status

    if (isClient && status === 'CANCELLED') {
      if (['PENDING', 'PAYMENT_PENDING'].includes(booking.status)) {
        newStatus = 'CANCELLED'
      } else {
        return NextResponse.json({ error: 'Vous ne pouvez plus annuler cette réservation directement' }, { status: 400 })
      }
    } else if ((isOwner || isAdmin) && status) {
      // Pour l'owner ou l'admin, on fait confiance à la valeur (avec validation enum)
      if (Object.values(BookingStatus).includes(status)) {
        newStatus = status
      }
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        adminNote: isAdmin && adminNote ? adminNote : booking.adminNote
      }
    })

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('PUT /api/bookings/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Seul l'admin a le droit de faire un hard delete d'une réservation (historique/comptabilité).
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé, utilisez l\'annulation' }, { status: 403 })
    }

    await prisma.booking.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/bookings/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
