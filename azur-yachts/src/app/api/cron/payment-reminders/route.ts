import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendBankTransferReminder1,
  sendBankTransferReminder2,
  sendBookingCancelled,
} from '@/lib/resend'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  let reminder1Sent = 0
  let reminder2Sent = 0
  let cancelled = 0

  try {
    // ── REMINDER 1 : T+1h ──────────────────────────────────
    const needsReminder1 = await prisma.payment.findMany({
      where: {
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        reminder1SentAt: null,
        createdAt: { lte: new Date(now.getTime() - 60 * 60 * 1000) },
      },
      include: {
        booking: {
          include: {
            client: true,
            listing: true,
          },
        },
      },
    })

    for (const payment of needsReminder1) {
      await sendBankTransferReminder1(
        payment.booking.client.email,
        payment.booking.client.firstName,
        payment.bankTransferRef || payment.bookingId,
        payment.amount,
        payment.bookingId
      )
      await prisma.payment.update({
        where: { id: payment.id },
        data: { reminder1SentAt: now },
      })
      reminder1Sent++
    }

    // ── REMINDER 2 : T+3h ──────────────────────────────────
    const needsReminder2 = await prisma.payment.findMany({
      where: {
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        reminder1SentAt: { not: null, lte: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
        reminder2SentAt: null,
      },
      include: {
        booking: {
          include: {
            client: true,
            listing: true,
          },
        },
      },
    })

    for (const payment of needsReminder2) {
      await sendBankTransferReminder2(
        payment.booking.client.email,
        payment.booking.client.firstName,
        payment.bankTransferRef || payment.bookingId,
        payment.amount,
        payment.bookingId
      )
      await prisma.payment.update({
        where: { id: payment.id },
        data: { reminder2SentAt: now },
      })
      reminder2Sent++
    }

    // ── AUTO CANCEL : T+24h ────────────────────────────────
    const expired = await prisma.payment.findMany({
      where: {
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        createdAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
      include: {
        booking: {
          include: {
            client: true,
            listing: true,
          },
        },
      },
    })

    for (const payment of expired) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CANCELLED' },
      })
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })
      await sendBookingCancelled(
        payment.booking.client.email,
        payment.booking.client.firstName,
        payment.bankTransferRef || payment.bookingId,
        payment.booking.listing.title,
        'Preuve de virement non reçue dans le délai de 24 heures.'
      )
      cancelled++
    }

    console.log(`✅ Cron: ${reminder1Sent} R1, ${reminder2Sent} R2, ${cancelled} cancelled`)

    return NextResponse.json({
      success: true,
      reminder1Sent,
      reminder2Sent,
      cancelled,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
