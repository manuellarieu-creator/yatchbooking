'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

type PaymentSettings = {
  activeMethod: 'STRIPE' | 'PAYPAL' | 'BANK_TRANSFER'
  stripePublicKey?: string
  bankAccountName?: string
  bankIban?: string
  bankBic?: string
  bankName?: string
}

type BookingDetails = {
  id: string
  totalPrice: number
  totalNights: number
  startDate: string
  endDate: string
  status: string
  listing: {
    title: string
    location: string
  }
  payment?: {
    bankTransferRef?: string
    status: string
  }
}

// ── Stripe Form Component ──────────────────────────────────
function StripeForm({ bookingId, total }: { bookingId: string; total: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${bookingId}/confirmation`,
      },
    })

    if (stripeError) {
      setError(stripeError.message || 'Erreur de paiement')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full py-4 bg-[#b8985a] hover:bg-[#d4b57a] text-white font-medium tracking-widest uppercase text-sm transition-all disabled:opacity-50"
      >
        {loading ? 'Paiement en cours…' : `Payer €${total.toLocaleString('fr-FR')}`}
      </button>
      <p className="text-center text-xs text-gray-400">
        🔒 Paiement sécurisé par Stripe · PCI-DSS niveau 1
      </p>
    </form>
  )
}

// ── Bank Transfer Component ─────────────────────────────────
function BankTransferSection({
  booking,
  settings,
}: {
  booking: BookingDetails
  settings: PaymentSettings
}) {
  const [showUpload, setShowUpload] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)

    try {
      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'azur_proofs')

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        { method: 'POST', body: formData }
      )
      const cloudData = await cloudRes.json()

      // Submit proof
      await fetch('/api/payments/bank-transfer/submit-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          proofUrl: cloudData.secure_url,
          proofPublicId: cloudData.public_id,
        }),
      })

      setSent(true)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-8 bg-green-50 border border-green-200 rounded">
        <div className="text-4xl mb-4">📨</div>
        <h3 className="text-xl font-light text-navy mb-2">Preuve envoyée !</h3>
        <p className="text-sm text-gray-500">
          Votre justificatif a bien été transmis à notre équipe. <strong>Votre réservation sera confirmée uniquement après vérification de la réception effective des fonds.</strong> La confirmation n'est pas immédiate.<br/>
          📦 Virement SEPA : 36–48h · ⚡ Instantané : 30–45 min
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0a1628] p-5 text-white space-y-3">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <span className="text-xs uppercase tracking-widest text-white/40">Titulaire</span>
          <span className="font-medium">{settings.bankAccountName}</span>
        </div>
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <span className="text-xs uppercase tracking-widest text-white/40">IBAN</span>
          <span className="font-medium text-sm">{settings.bankIban}</span>
        </div>
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <span className="text-xs uppercase tracking-widest text-white/40">BIC</span>
          <span className="font-medium">{settings.bankBic}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-widest text-white/40">Banque</span>
          <span className="font-medium">{settings.bankName}</span>
        </div>
      </div>

      <div className="bg-[#b8985a] p-4 flex justify-between items-center">
        <span className="text-xs uppercase tracking-widest text-white/70">Montant à virer</span>
        <span className="text-2xl font-light text-white">
          €{booking.totalPrice.toLocaleString('fr-FR')}
        </span>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
        <div className="text-xs uppercase tracking-widest text-amber-600 mb-1">
          Référence obligatoire
        </div>
        <div className="text-xl font-bold text-[#0a1628] tracking-wider">
          {booking.payment?.bankTransferRef || booking.id}
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 p-3 text-sm text-orange-700">
        ⏳ Vous disposez de <strong>24 heures</strong> pour effectuer le virement et soumettre votre preuve.
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p>📦 <strong>Virement SEPA</strong> : confirmation sous 36–48h</p>
        <p>⚡ <strong>Virement instantané</strong> : confirmation sous 30–45 min</p>
      </div>

      {!showUpload ? (
        <button
          onClick={() => setShowUpload(true)}
          className="text-[#b8985a] text-sm underline cursor-pointer"
        >
          ▾ Votre paiement est effectué ? Joindre l'ordre de virement
        </button>
      ) : (
        <div className="space-y-3">
          <div
            className="border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-[#b8985a] hover:bg-amber-50 transition-all"
            onClick={() => document.getElementById('proof-input')?.click()}
          >
            <div className="text-3xl mb-2">📎</div>
            <p className="text-sm text-gray-500">
              {file ? file.name : 'Glissez votre fichier ou cliquez pour sélectionner'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — 10 Mo max</p>
          </div>
          <input
            id="proof-input"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full py-3 bg-[#0a1628] text-white text-sm uppercase tracking-widest hover:bg-[#b8985a] transition-all disabled:opacity-50"
            >
              {uploading ? 'Envoi en cours…' : 'ENVOYER LA PREUVE'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────
export default function PaymentPage() {
  const params = useParams()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [bookingRes, settingsRes] = await Promise.all([
          fetch(`/api/bookings/${bookingId}`),
          fetch('/api/payments/settings'),
        ])
        const { booking } = await bookingRes.json()
        const settingsData = await settingsRes.json()

        setBooking(booking)
        setSettings(settingsData)

        if (settingsData.activeMethod === 'STRIPE' && settingsData.stripePublicKey) {
          setStripePromise(loadStripe(settingsData.stripePublicKey))
          const intentRes = await fetch('/api/payments/stripe/create-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId }),
          })
          const { clientSecret } = await intentRes.json()
          setClientSecret(clientSecret)
        }
      } catch (error) {
        console.error('Load error:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#b8985a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Chargement du paiement…</p>
        </div>
      </div>
    )
  }

  if (!booking || !settings) return null

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <nav className="bg-[#0a1628] h-16 flex items-center justify-between px-8 sticky top-0 z-50">
        <span className="font-serif text-xl font-semibold tracking-widest text-white">
          AZUR<span className="text-[#d4b57a]"> YACHTS</span>
        </span>
        <span className="text-xs text-white/40 tracking-wider">🔒 Paiement sécurisé</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-[#b8985a] mb-1">Étape 3 / 4</p>
            <h1 className="text-3xl font-light text-[#0a1628]">
              {settings.activeMethod === 'STRIPE' && 'Paiement par carte'}
              {settings.activeMethod === 'PAYPAL' && 'Paiement PayPal'}
              {settings.activeMethod === 'BANK_TRANSFER' && 'Virement bancaire'}
            </h1>
          </div>

          <div className="bg-white border border-[#e8e0d0] p-6">
            {settings.activeMethod === 'STRIPE' && clientSecret && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeForm bookingId={bookingId} total={booking.totalPrice} />
              </Elements>
            )}

            {settings.activeMethod === 'BANK_TRANSFER' && (
              <div>
                <div className="bg-white border border-green-200 border-l-4 border-l-green-500 p-4 mb-6">
                  <p className="font-medium text-green-800">✅ Demande de réservation envoyée</p>
                  <p className="text-sm text-green-600 mt-1">
                    Pour valider votre réservation, effectuez le virement ci-dessous. <strong>La confirmation n'est pas immédiate</strong> : notre équipe vérifiera manuellement la réception des fonds.
                  </p>
                </div>
                <BankTransferSection booking={booking} settings={settings} />
              </div>
            )}

            {settings.activeMethod === 'PAYPAL' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🅿</div>
                <h3 className="text-xl font-light text-[#0a1628] mb-2">Payer avec PayPal</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Vous serez redirigé vers PayPal pour finaliser votre paiement.
                </p>
                <button className="w-full py-4 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold rounded text-sm tracking-wider transition-all">
                  🅿 Payer €{booking.totalPrice.toLocaleString('fr-FR')} avec PayPal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#e8e0d0] sticky top-24">
            <div className="bg-[#0a1628] p-5 border-t-4 border-[#b8985a]">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Récapitulatif</p>
              <p className="text-white font-serif text-lg">{booking.listing.title}</p>
              <p className="text-white/40 text-xs mt-1">📍 {booking.listing.location}</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Arrivée</span>
                <span className="font-medium">
                  {new Date(booking.startDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Départ</span>
                <span className="font-medium">
                  {new Date(booking.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Durée</span>
                <span className="font-medium">{booking.totalNights} nuits</span>
              </div>
              <div className="border-t border-[#e8e0d0] pt-3 flex justify-between items-baseline">
                <span className="font-semibold text-[#0a1628]">Total</span>
                <span className="text-2xl font-light font-serif text-[#0a1628]">
                  €{booking.totalPrice.toLocaleString('fr-FR')}
                </span>
              </div>
              <p className="text-xs text-gray-400 pt-2 border-t border-[#e8e0d0]">
                ✅ Validation manuelle par notre équipe avant confirmation.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
