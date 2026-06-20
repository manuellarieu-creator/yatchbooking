import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@azuryachts.vercel.app'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@azuryachts.vercel.app'

// ── BASE TEMPLATE ──────────────────────────────────────────
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Jost', Arial, sans-serif; background: #faf8f4; color: #1a1a2e; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 2rem 1rem; }
        .header { background: #0a1628; padding: 1.5rem 2rem; text-align: center; border-top: 3px solid #b8985a; }
        .logo { font-size: 1.6rem; font-weight: 700; color: #fff; letter-spacing: 0.15em; }
        .logo span { color: #d4b57a; }
        .body { background: #fff; border: 1px solid #e8e0d0; padding: 2rem; }
        .title { font-size: 1.5rem; color: #0a1628; margin-bottom: 1rem; font-weight: 300; }
        .text { font-size: 0.9rem; color: #4a4a6a; line-height: 1.8; margin-bottom: 1rem; }
        .btn { display: inline-block; background: #b8985a; color: #fff; padding: 0.85rem 2rem; text-decoration: none; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; margin: 1rem 0; }
        .info-box { background: #f0e4c8; border-left: 3px solid #b8985a; padding: 1rem; margin: 1rem 0; font-size: 0.85rem; color: #7a5c20; }
        .divider { height: 1px; background: #e8e0d0; margin: 1.5rem 0; }
        .footer { background: #0a1628; padding: 1rem 2rem; text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.35); }
        .ref { font-size: 1.1rem; font-weight: 700; color: #0a1628; letter-spacing: 0.08em; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="logo">AZUR<span> YACHTS</span></div>
        </div>
        <div class="body">${content}</div>
        <div class="footer">
          © 2025 VoyYacht SAM · Monaco · 
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #b8985a;">voyyacht.com</a>
        </div>
      </div>
    </body>
    </html>
  `
}

// ── EMAIL FUNCTIONS ────────────────────────────────────────

export async function sendEmailVerification(email: string, firstName: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Confirmez votre adresse email — VoyYacht',
    html: baseTemplate(`
      <h2 class="title">Confirmez votre email</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Merci de vous être inscrit sur VoyYacht. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
      <a href="${link}" class="btn">Confirmer mon email</a>
      <p class="text" style="font-size:0.75rem;color:#8a8aaa;">Ce lien est valable 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
    `),
  })
}

export async function sendPasswordReset(email: string, firstName: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Réinitialiser votre mot de passe — VoyYacht',
    html: baseTemplate(`
      <h2 class="title">Réinitialiser votre mot de passe</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez ci-dessous pour en créer un nouveau.</p>
      <a href="${link}" class="btn">Réinitialiser mon mot de passe</a>
      <div class="info-box">⏱ Ce lien est valable <strong>1 heure</strong> et ne peut être utilisé qu'une seule fois.</div>
      <p class="text" style="font-size:0.75rem;color:#8a8aaa;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    `),
  })
}

export async function sendBookingConfirmation(
  email: string,
  firstName: string,
  ref: string,
  boatName: string,
  startDate: string,
  endDate: string,
  total: number
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Votre réservation est confirmée 🎉 — ${boatName}`,
    html: baseTemplate(`
      <h2 class="title">Réservation confirmée !</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Votre réservation pour <strong>${boatName}</strong> a été confirmée par notre équipe.</p>
      <div class="info-box">
        <strong>Référence :</strong> <span class="ref">${ref}</span><br>
        <strong>Dates :</strong> ${startDate} → ${endDate}<br>
        <strong>Total :</strong> €${total.toLocaleString('fr-FR')}
      </div>
      <p class="text">Notre équipe reste disponible 7j/7 pour toute question.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" class="btn">Voir ma réservation</a>
    `),
  })
}

export async function sendBookingRejected(
  email: string,
  firstName: string,
  ref: string,
  boatName: string,
  reason?: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Votre réservation n'a pas pu être acceptée — VoyYacht`,
    html: baseTemplate(`
      <h2 class="title">Réservation non acceptée</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Nous sommes désolés, votre réservation <strong>${ref}</strong> pour <strong>${boatName}</strong> n'a pas pu être confirmée.</p>
      ${reason ? `<div class="info-box"><strong>Motif :</strong> ${reason}</div>` : ''}
      <p class="text">Vous pouvez consulter d'autres yachts disponibles sur notre plateforme.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/listing" class="btn">Explorer les yachts</a>
    `),
  })
}

export async function sendPaymentProofReceived(
  adminEmail: string,
  clientName: string,
  ref: string,
  amount: number,
  proofUrl: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `Preuve de virement reçue — ${ref} — €${amount.toLocaleString('fr-FR')}`,
    html: baseTemplate(`
      <h2 class="title">Nouvelle preuve de virement</h2>
      <p class="text">Une preuve de virement a été soumise par <strong>${clientName}</strong>.</p>
      <div class="info-box">
        <strong>Référence :</strong> ${ref}<br>
        <strong>Montant :</strong> €${amount.toLocaleString('fr-FR')}
      </div>
      <a href="${proofUrl}" class="btn">Voir le justificatif</a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/payments" class="btn" style="background:#0a1628;margin-left:1rem;">Valider dans l'admin</a>
    `),
  })
}

export async function sendBankTransferReminder1(
  email: string,
  firstName: string,
  ref: string,
  amount: number,
  bookingId: string
) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}/payment`
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Votre réservation est en attente — Action requise',
    html: baseTemplate(`
      <h2 class="title">Action requise</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Nous avons le plaisir de vous annoncer que votre réservation est toujours en attente de confirmation.</p>
      <p class="text">Afin de finaliser cette réservation, nous vous prions de transmettre, par email ou via le bouton ci-dessous, l'ordre du virement correspondant.</p>
      <div class="info-box">
        <strong>Référence :</strong> ${ref}<br>
        <strong>Montant :</strong> €${amount.toLocaleString('fr-FR')}
      </div>
      <a href="${link}" class="btn">Joindre mon ordre de virement</a>
      <div class="divider"></div>
      <p class="text">ℹ️ <strong>Virement SEPA :</strong> délai de confirmation de 36 à 48 heures après réception.</p>
      <p class="text">⚡ <strong>Virement instantané :</strong> délai de confirmation de 30 à 45 minutes.</p>
      <p class="text" style="font-size:0.75rem;color:#c0392b;">⚠️ Votre réservation sera automatiquement annulée si aucune preuve n'est transmise dans les 24h.</p>
    `),
  })
}

export async function sendBankTransferReminder2(
  email: string,
  firstName: string,
  ref: string,
  amount: number,
  bookingId: string
) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}/payment`
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: '⚠️ Dernière relance — Réservation bientôt annulée',
    html: baseTemplate(`
      <h2 class="title">⚠️ Dernière relance</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Nous revenons vers vous concernant votre réservation <strong>${ref}</strong> toujours en attente de paiement.</p>
      <p class="text">Pour éviter l'annulation automatique, transmettez dès maintenant votre ordre de virement.</p>
      <div class="info-box" style="background:#fef0f0;border-color:#f5c6c6;color:#c0392b;">
        <strong>Montant :</strong> €${amount.toLocaleString('fr-FR')}<br>
        <strong>Référence :</strong> ${ref}
      </div>
      <a href="${link}" class="btn" style="background:#c0392b;">Joindre mon ordre de virement</a>
      <div class="divider"></div>
      <p class="text">ℹ️ <strong>Virement SEPA :</strong> 36 à 48 heures après réception.</p>
      <p class="text">⚡ <strong>Virement instantané :</strong> 30 à 45 minutes.</p>
      <p class="text" style="font-size:0.75rem;color:#8a8aaa;">Sans transmission de votre preuve, votre réservation sera annulée dans les prochaines heures.</p>
    `),
  })
}

export async function sendBookingCancelled(
  email: string,
  firstName: string,
  ref: string,
  boatName: string,
  reason: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Réservation annulée — ${ref}`,
    html: baseTemplate(`
      <h2 class="title">Réservation annulée</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Votre réservation <strong>${ref}</strong> pour <strong>${boatName}</strong> a été annulée.</p>
      <div class="info-box"><strong>Motif :</strong> ${reason}</div>
      <p class="text">Aucun montant n'a été débité. Vous pouvez effectuer une nouvelle réservation à tout moment.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/listing" class="btn">Explorer les yachts</a>
    `),
  })
}

export async function sendListingApproved(
  email: string,
  firstName: string,
  listingTitle: string,
  listingId: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Votre annonce est en ligne ! — ${listingTitle}`,
    html: baseTemplate(`
      <h2 class="title">Annonce publiée ! 🎉</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Excellente nouvelle ! Votre annonce <strong>${listingTitle}</strong> a été validée par notre équipe et est maintenant visible par tous les clients.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/listing/${listingId}" class="btn">Voir mon annonce</a>
    `),
  })
}

export async function sendListingRejected(
  email: string,
  firstName: string,
  listingTitle: string,
  reason: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Votre annonce nécessite des modifications — ${listingTitle}`,
    html: baseTemplate(`
      <h2 class="title">Annonce non approuvée</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Votre annonce <strong>${listingTitle}</strong> n'a pas été approuvée pour la raison suivante :</p>
      <div class="info-box">${reason}</div>
      <p class="text">Vous pouvez modifier votre annonce depuis votre tableau de bord et la soumettre à nouveau.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings" class="btn">Modifier mon annonce</a>
    `),
  })
}

export async function sendAccountApproved(email: string, firstName: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Votre compte annonceur est vérifié ✓ — VoyYacht',
    html: baseTemplate(`
      <h2 class="title">Compte vérifié ! ✓</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Votre identité a été vérifiée avec succès. Le badge <strong>✓ Vérifié</strong> est maintenant affiché sur toutes vos annonces.</p>
      <p class="text">Vous pouvez dès maintenant publier vos premières annonces.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/listings/new" class="btn">Publier une annonce</a>
    `),
  })
}

export async function sendOtpEmail(email: string, firstName: string, otp: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Votre code de vérification VoyYacht',
    html: baseTemplate(`
      <h2 class="title">Vérification de votre compte</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Merci de vous inscrire sur VoyYacht en tant qu'Annonceur. Pour continuer, veuillez saisir le code de vérification ci-dessous :</p>
      <div style="background: #fdf8f0; border: 2px dashed #d4b57a; padding: 1.5rem; text-align: center; font-size: 2rem; font-weight: bold; letter-spacing: 0.2em; color: #b8985a; margin: 1.5rem 0;">
        ${otp}
      </div>
      <p class="text">Ce code est valide pendant 15 minutes.</p>
    `),
  })
}

export async function send2faEmail(email: string, firstName: string, otp: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Code de sécurité (2FA) — VoyYacht',
    html: baseTemplate(`
      <h2 class="title">Connexion sécurisée</h2>
      <p class="text">Bonjour ${firstName},</p>
      <p class="text">Une tentative de connexion a été détectée. Veuillez utiliser le code de sécurité suivant pour accéder à votre compte :</p>
      <div style="background: #fdf8f0; border: 2px dashed #d4b57a; padding: 1.5rem; text-align: center; font-size: 2rem; font-weight: bold; letter-spacing: 0.2em; color: #b8985a; margin: 1.5rem 0;">
        ${otp}
      </div>
      <p class="text">Ce code est valide pendant 10 minutes. Si vous n'avez pas tenté de vous connecter, veuillez ignorer cet email et modifier votre mot de passe si nécessaire.</p>
    `),
  })
}

export async function sendNewBookingAdmin(
  adminEmail: string,
  clientName: string,
  boatName: string,
  startDate: string,
  endDate: string,
  total: number,
  ref: string,
  paymentMethod: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `🚨 Nouvelle réservation — ${boatName} (${ref})`,
    html: baseTemplate(`
      <h2 class="title">Nouvelle réservation reçue</h2>
      <p class="text">Une nouvelle réservation vient d'être effectuée par <strong>${clientName}</strong>.</p>
      <div class="info-box">
        <strong>Référence :</strong> <span class="ref">${ref}</span><br>
        <strong>Yacht :</strong> ${boatName}<br>
        <strong>Dates :</strong> ${startDate} → ${endDate}<br>
        <strong>Total :</strong> €${total.toLocaleString('fr-FR')}<br>
        <strong>Méthode de paiement :</strong> ${paymentMethod}
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings" class="btn" style="background:#0a1628;">Gérer les réservations</a>
    `),
  })
}

export async function sendNewListingAdmin(
  adminEmail: string,
  advertiserName: string,
  boatName: string,
  listingId: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `🔔 Nouvelle annonce à valider — ${boatName}`,
    html: baseTemplate(`
      <h2 class="title">Nouvelle annonce en attente</h2>
      <p class="text">L'annonceur <strong>${advertiserName}</strong> vient de soumettre une nouvelle annonce pour le yacht <strong>${boatName}</strong>.</p>
      <p class="text">Cette annonce est en attente de votre validation avant d'être visible par les clients.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/listings" class="btn" style="background:#0a1628;">Voir les annonces à valider</a>
    `),
  })
}
