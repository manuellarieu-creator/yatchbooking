import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    if (!settings) {
      return NextResponse.json({
        activeMethod: 'STRIPE',
        stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
        paypalClientId: null,
        bankAccountName: null,
        bankIban: null,
        bankBic: null,
        bankName: null,
      })
    }
    // Never expose secret keys to client
    return NextResponse.json({
      activeMethod: settings.activeMethod,
      stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      paypalClientId: settings.paypalClientId,
      bankAccountName: settings.bankAccountName,
      bankIban: settings.bankIban,
      bankBic: settings.bankBic,
      bankName: settings.bankName,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
