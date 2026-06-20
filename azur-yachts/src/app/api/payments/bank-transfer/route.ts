import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'
import { sendBankTransferReminder1, sendNewBookingAdmin } from '@/lib/resend'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const userId = session.user.id as string

    const body = await req.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId est requis' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (booking.clientId !== userId) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 })
    }

    // Generate a unique reference e.g., REF-8A2B9C
    const ref = `REF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

    let payment = booking.payment

    // If a payment already exists, update it to bank transfer if needed
    if (payment) {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          method: 'BANK_TRANSFER',
          status: 'PENDING',
          bankTransferRef: payment.bankTransferRef || ref,
        },
      })
    } else {
      // Create a new payment record
      payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          currency: 'EUR',
          method: 'BANK_TRANSFER',
          status: 'PENDING',
          bankTransferRef: ref,
        },
      })
    }

    // Update booking status
    if (booking.status === 'PENDING') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'PAYMENT_PENDING' },
      })
    }

    await sendBankTransferReminder1(
      booking.client.email,
      booking.client.firstName,
      payment.bankTransferRef!,
      payment.amount,
      booking.id
    )

    // Envoi de la notification Admin
    await sendNewBookingAdmin(
      process.env.ADMIN_EMAIL || 'admin@azuryachts.vercel.app',
      `${booking.client.firstName} ${booking.client.lastName}`,
      booking.listing.title,
      booking.startDate.toLocaleDateString('fr-FR'),
      booking.endDate.toLocaleDateString('fr-FR'),
      booking.totalPrice,
      payment.bankTransferRef || booking.id,
      'Virement Bancaire (En attente)'
    )

    return NextResponse.json({
      success: true,
      payment,
    })

  } catch (error) {
    console.error('Bank transfer initialization error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
