import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { auth } from '@/auth'
import { sendPaymentProofReceived } from '@/lib/resend'
import { v2 as cloudinary } from 'cloudinary'

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const userId = session.user.id as string

    const body = await req.json()
    const { paymentId, proofBase64 } = body

    if (!paymentId || !proofBase64) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    if (payment.booking.clientId !== userId) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 })
    }

    // Upload de la preuve vers Cloudinary
    let proofUrl = ''
    try {
      const uploadResponse = await cloudinary.uploader.upload(proofBase64, {
        folder: 'azur_yachts_proofs',
      })
      proofUrl = uploadResponse.secure_url
    } catch (uploadError) {
      console.error('Erreur upload Cloudinary:', uploadError)
      return NextResponse.json({ error: 'Erreur lors du téléchargement du fichier' }, { status: 500 })
    }

    // Update the payment with proof
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PROOF_SUBMITTED',
        bankProofUrl: proofUrl,
        bankProofSubmittedAt: new Date(),
      },
    })

    // Send email to admin
    await sendPaymentProofReceived(
      process.env.ADMIN_EMAIL || 'admin@voyyacht.vercel.app',
      payment.booking.client.firstName + ' ' + payment.booking.client.lastName,
      payment.bankTransferRef || payment.bookingId,
      payment.amount,
      proofUrl
    )

    return NextResponse.json({
      success: true,
      proofUrl,
    })

  } catch (error) {
    console.error('Bank transfer proof error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
