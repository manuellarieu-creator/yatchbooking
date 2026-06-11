import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendPaymentProofReceived } from '@/lib/resend'
import { ADMIN_EMAIL } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { bookingId, proofUrl, proofPublicId } = body

    if (!bookingId || !proofUrl) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        listing: true,
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (booking.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Update payment
    await prisma.payment.update({
      where: { bookingId },
      data: {
        bankProofUrl: proofUrl,
        bankProofPublicId: proofPublicId,
        bankProofSubmittedAt: new Date(),
        status: 'PROOF_SUBMITTED',
      },
    })

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'PAYMENT_RECEIVED' },
    })

    // Notify admin by email
    await sendPaymentProofReceived(
      ADMIN_EMAIL,
      `${booking.client.firstName} ${booking.client.lastName}`,
      booking.payment?.bankTransferRef || bookingId,
      booking.totalPrice,
      proofUrl
    )

    // Create notification for admin
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (admin) {
      await prisma.notification.create({
        data: {
          type: 'PAYMENT_RECEIVED',
          title: 'Preuve de virement reçue',
          body: `${booking.client.firstName} a soumis une preuve pour la réservation ${booking.payment?.bankTransferRef}`,
          link: `/admin/payments`,
          userId: admin.id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submit proof error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
