import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM || 'VoyYacht <noreply@azuryachts.vercel.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://azuryachts.vercel.app'

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;background:#faf8f4;color:#1a1a2e}
  .wrap{max-width:580px;margin:0 auto;padding:2rem 1rem}
  .top{background:#0a1628;padding:1.5rem 2rem;text-align:center;border-top:3px solid #b8985a}
  .logo{font-size:1.5rem;font-weight:700;color:#fff;letter-spacing:.15em}
  .logo span{color:#d4b57a}
  .card{background:#fff;border:1px solid #e8e0d0;padding:2rem}
  h2{font-size:1.4rem;color:#0a1628;margin-bottom:1rem;font-weight:400}
  p{font-size:.9rem;color:#4a4a6a;line-height:1.8;margin-bottom:.9rem}
  .btn{display:inline-block;background:#b8985a;color:#fff;padding:.85rem 2rem;
       text-decoration:none;font-size:.85rem;letter-spacing:.1em;
       text-transform:uppercase;margin:1rem 0}
  .box{background:#f0e4c8;border-left:3px solid #b8985a;padding:1rem;
       margin:1rem 0;font-size:.85rem;color:#7a5c20}
  .box-red{background:#fef0f0;border-left:3px solid #c0392b;padding:1rem;
            margin:1rem 0;font-size:.85rem;color:#c0392b}
  .foot{background:#0a1628;padding:1rem 2rem;text-align:center;
        font-size:.72rem;color:rgba(255,255,255,.3)}
  .foot a{color:#b8985a}
  hr{border:none;border-top:1px solid #e8e0d0;margin:1.25rem 0}
</style>
</head>
<body>
<div class="wrap">
  <div class="top"><div class="logo">AZUR<span> YACHTS</span></div></div>
  <div class="card">${content}</div>
  <div class="foot">© 2025 VoyYacht · Monaco · 
    <a href="${APP_URL}">voyyacht.com</a>
  </div>
</div>
</body>
</html>`
}

// 1. Vérification email
export async function emailVerification(to: string, name: string, token: string) {
  const url = `${APP_URL}/api/auth/verify?token=${token}`
  return resend.emails.send({
    from: FROM, to,
    subject: 'Confirmez votre email — VoyYacht',
    html: base(`
      <h2>Confirmez votre adresse email</h2>
      <p>Bonjour ${name},</p>
      <p>Merci de vous être inscrit sur VoyYacht. Cliquez ci-dessous pour activer votre compte.</p>
      <a href="${url}" class="btn">Confirmer mon email</a>
      <p style="font-size:.75rem;color:#8a8aaa">Lien valable 24h. Si vous n'avez pas créé de compte, ignorez cet email.</p>
    `),
  })
}

// 2. Réinitialisation mot de passe
export async function emailResetPassword(to: string, name: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`
  return resend.emails.send({
    from: FROM, to,
    subject: 'Réinitialiser votre mot de passe — VoyYacht',
    html: base(`
      <h2>Réinitialiser votre mot de passe</h2>
      <p>Bonjour ${name},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <a href="${url}" class="btn">Réinitialiser mon mot de passe</a>
      <div class="box">⏱ Lien valable <strong>1 heure</strong>, usage unique.</div>
      <p style="font-size:.75rem;color:#8a8aaa">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    `),
  })
}

// 3. Réservation confirmée (client)
export async function emailBookingConfirmed(
  to: string, name: string,
  ref: string, boat: string,
  start: string, end: string, total: number
) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Réservation confirmée 🎉 — ${boat}`,
    html: base(`
      <h2>Votre réservation est confirmée !</h2>
      <p>Bonjour ${name},</p>
      <p>Votre réservation pour <strong>${boat}</strong> a été confirmée par notre équipe.</p>
      <div class="box">
        <strong>Référence :</strong> ${ref}<br>
        <strong>Dates :</strong> ${start} → ${end}<br>
        <strong>Total :</strong> €${total.toLocaleString('fr-FR')}
      </div>
      <a href="${APP_URL}/bookings" class="btn">Voir ma réservation</a>
      <p>Notre équipe reste disponible 7j/7 pour toute question.</p>
    `),
  })
}

// 4. Réservation rejetée (client)
export async function emailBookingRejected(
  to: string, name: string,
  ref: string, boat: string, reason?: string
) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Réservation non acceptée — ${ref}`,
    html: base(`
      <h2>Réservation non acceptée</h2>
      <p>Bonjour ${name},</p>
      <p>Votre réservation <strong>${ref}</strong> pour <strong>${boat}</strong> n'a pas pu être confirmée.</p>
      ${reason ? `<div class="box-red"><strong>Motif :</strong> ${reason}</div>` : ''}
      <a href="${APP_URL}/listing" class="btn">Explorer d'autres yachts</a>
    `),
  })
}

// 5. Annulation automatique virement (client)
export async function emailBookingCancelled(
  to: string, name: string,
  ref: string, boat: string, reason: string
) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Réservation annulée — ${ref}`,
    html: base(`
      <h2>Réservation annulée</h2>
      <p>Bonjour ${name},</p>
      <p>Votre réservation <strong>${ref}</strong> pour <strong>${boat}</strong> a été annulée.</p>
      <div class="box-red"><strong>Motif :</strong> ${reason}</div>
      <p>Aucun montant n'a été débité. Vous pouvez effectuer une nouvelle réservation.</p>
      <a href="${APP_URL}/listing" class="btn">Réserver un autre yacht</a>
    `),
  })
}

// 6. Relance virement T+1h
export async function emailVirementRelance1(
  to: string, name: string,
  ref: string, amount: number, bookingId: string
) {
  const url = `${APP_URL}/bookings/${bookingId}/payment`
  return resend.emails.send({
    from: FROM, to,
    subject: 'Action requise — Votre réservation attend votre virement',
    html: base(`
      <h2>Votre réservation attend votre paiement</h2>
      <p>Bonjour ${name},</p>
      <p>Nous avons le plaisir de vous annoncer que votre réservation est toujours en attente de confirmation.</p>
      <p>Afin de finaliser cette réservation, nous vous prions de transmettre par email ou via le bouton ci-dessous l'ordre du virement.</p>
      <div class="box">
        <strong>Référence :</strong> ${ref}<br>
        <strong>Montant :</strong> €${amount.toLocaleString('fr-FR')}
      </div>
      <a href="${url}" class="btn">Joindre mon ordre de virement</a>
      <hr>
      <p>📦 <strong>Virement SEPA :</strong> confirmation sous 36–48h après réception.</p>
      <p>⚡ <strong>Virement instantané :</strong> confirmation sous 30–45 minutes.</p>
      <div class="box-red">⚠️ Votre réservation sera automatiquement annulée sans preuve dans les 24h.</div>
    `),
  })
}

// 7. Relance virement T+3h
export async function emailVirementRelance2(
  to: string, name: string,
  ref: string, amount: number, bookingId: string
) {
  const url = `${APP_URL}/bookings/${bookingId}/payment`
  return resend.emails.send({
    from: FROM, to,
    subject: '⚠️ Dernière relance — Réservation bientôt annulée',
    html: base(`
      <h2>⚠️ Dernière relance</h2>
      <p>Bonjour ${name},</p>
      <p>Votre réservation <strong>${ref}</strong> est toujours en attente de votre preuve de virement.</p>
      <p>Pour éviter l'annulation automatique, transmettez votre justificatif dès maintenant.</p>
      <div class="box-red">
        <strong>Montant :</strong> €${amount.toLocaleString('fr-FR')}<br>
        <strong>Référence :</strong> ${ref}
      </div>
      <a href="${url}" class="btn" style="background:#c0392b">Joindre maintenant</a>
      <hr>
      <p>📦 <strong>Virement SEPA :</strong> 36–48h · ⚡ <strong>Instantané :</strong> 30–45 min</p>
    `),
  })
}

// 8. Preuve de virement reçue (admin)
export async function emailProofReceived(
  adminEmail: string, clientName: string,
  ref: string, amount: number, proofUrl: string
) {
  return resend.emails.send({
    from: FROM, to: adminEmail,
    subject: `Preuve de virement reçue — ${ref} — €${amount.toLocaleString('fr-FR')}`,
    html: base(`
      <h2>Nouvelle preuve de virement</h2>
      <p><strong>${clientName}</strong> a soumis une preuve de paiement.</p>
      <div class="box">
        <strong>Référence :</strong> ${ref}<br>
        <strong>Montant :</strong> €${amount.toLocaleString('fr-FR')}
      </div>
      <a href="${proofUrl}" class="btn">Voir le justificatif</a>
      <a href="${APP_URL}/admin/payments" class="btn" style="background:#0a1628;margin-left:.5rem">
        Valider dans l'admin
      </a>
    `),
  })
}

// 9. Annonce approuvée (annonceur)
export async function emailListingApproved(
  to: string, name: string, title: string, listingId: string
) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Votre annonce est en ligne ! — ${title}`,
    html: base(`
      <h2>Annonce publiée ! 🎉</h2>
      <p>Bonjour ${name},</p>
      <p>Votre annonce <strong>${title}</strong> a été validée et est maintenant visible par tous les clients.</p>
      <a href="${APP_URL}/yacht/${listingId}" class="btn">Voir mon annonce</a>
    `),
  })
}

// 10. Annonce rejetée (annonceur)
export async function emailListingRejected(
  to: string, name: string, title: string, reason: string
) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Annonce nécessite des modifications — ${title}`,
    html: base(`
      <h2>Annonce non approuvée</h2>
      <p>Bonjour ${name},</p>
      <p>Votre annonce <strong>${title}</strong> n'a pas été approuvée.</p>
      <div class="box-red">${reason}</div>
      <p>Vous pouvez la modifier et la soumettre à nouveau depuis votre tableau de bord.</p>
      <a href="${APP_URL}/dashboard" class="btn">Modifier mon annonce</a>
    `),
  })
}

// 11. Compte annonceur approuvé
export async function emailAccountApproved(to: string, name: string) {
  return resend.emails.send({
    from: FROM, to,
    subject: 'Votre compte annonceur est vérifié ✓',
    html: base(`
      <h2>Compte vérifié ✓</h2>
      <p>Bonjour ${name},</p>
      <p>Votre identité a été vérifiée avec succès par notre équipe.</p>
      <p>Le badge <strong>✓ Vérifié</strong> est maintenant affiché sur toutes vos annonces.</p>
      <a href="${APP_URL}/publish" class="btn">Publier ma première annonce</a>
    `),
  })
}

// 12. Nouveau message reçu (hors ligne)
export async function emailNewMessage(
  to: string, name: string, senderName: string, preview: string
) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Nouveau message de ${senderName} — VoyYacht`,
    html: base(`
      <h2>Vous avez un nouveau message</h2>
      <p>Bonjour ${name},</p>
      <p><strong>${senderName}</strong> vous a envoyé un message :</p>
      <div class="box" style="font-style:italic">"${preview}"</div>
      <a href="${APP_URL}/messages" class="btn">Répondre</a>
    `),
  })
}

// 13. Virement validé (client)
export async function emailBankTransferValidated(
  to: string, name: string,
  amount: number, boat: string,
  start: string, end: string
) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Confirmation de votre paiement et de votre réservation - VoyYacht`,
    html: base(`
      <h2>Virement bancaire reçu</h2>
      <p>Bonjour ${name},</p>
      <p>Nous avons le plus grand plaisir de vous confirmer la bonne réception de votre virement bancaire d'un montant de <strong>€${amount.toLocaleString('fr-FR')}</strong>.</p>
      <p>Par conséquent, votre réservation pour le magnifique yacht <strong>${boat}</strong> est désormais <strong>totalement confirmée</strong> pour la période du <strong>${start}</strong> au <strong>${end}</strong>.</p>
      <div class="box">
        <strong>Instructions importantes pour votre embarquement :</strong><br><br>
        - Le rendez-vous est fixé au port d'attache du navire.<br>
        - N'oubliez pas de vous munir de votre pièce d'identité et de votre permis bateau si applicable.<br>
        - Un état des lieux sera réalisé à votre arrivée.
      </div>
      <p>Nous restons à votre entière disposition pour toute demande supplémentaire afin de préparer au mieux votre sortie en mer.</p>
      <a href="${APP_URL}/bookings" class="btn">Voir ma réservation</a>
    `),
  })
}

// 14. Virement rejeté (client)
export async function emailBankTransferRejected(
  to: string, name: string,
  boat: string, start: string, end: string, reason: string
) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Problème concernant votre paiement par virement - VoyYacht`,
    html: base(`
      <h2>Paiement par virement non validé</h2>
      <p>Bonjour ${name},</p>
      <p>Nous vous contactons concernant votre réservation pour le yacht <strong>${boat}</strong> (du ${start} au ${end}).</p>
      <p>Malheureusement, nous n'avons pas pu valider votre paiement par virement bancaire pour la raison suivante :</p>
      <div class="box-red">
        <strong>${reason}</strong>
      </div>
      <p>En conséquence, le statut de votre réservation est actuellement mis en attente ou rejeté.</p>
      <p>Nous vous invitons à nous contacter dans les plus brefs délais ou à procéder à un nouveau paiement depuis votre espace client pour sécuriser votre réservation.</p>
      <a href="${APP_URL}/dashboard" class="btn">Aller à mon espace client</a>
    `),
  })
}

export async function emailNewBookingAdmin(
  adminEmail: string,
  clientName: string,
  boatName: string,
  start: string,
  end: string,
  total: number,
  ref: string,
  paymentMethod: string
) {
  return resend.emails.send({
    from: FROM, to: adminEmail,
    subject: `🚨 Nouvelle réservation — ${boatName} (${ref})`,
    html: base(`
      <h2>Nouvelle réservation reçue</h2>
      <p>Une nouvelle réservation vient d'être effectuée par <strong>${clientName}</strong>.</p>
      <div class="box">
        <strong>Référence :</strong> ${ref}<br>
        <strong>Yacht :</strong> ${boatName}<br>
        <strong>Dates :</strong> ${start} → ${end}<br>
        <strong>Total :</strong> €${total.toLocaleString('fr-FR')}<br>
        <strong>Méthode de paiement :</strong> ${paymentMethod}
      </div>
      <a href="${APP_URL}/admin/bookings" class="btn" style="background:#0a1628">Gérer les réservations</a>
    `),
  })
}

export async function emailNewListingAdmin(
  adminEmail: string,
  advertiserName: string,
  boatName: string,
  listingId: string
) {
  return resend.emails.send({
    from: FROM, to: adminEmail,
    subject: `🔔 Nouvelle annonce à valider — ${boatName}`,
    html: base(`
      <h2>Nouvelle annonce en attente</h2>
      <p>L'annonceur <strong>${advertiserName}</strong> vient de soumettre une nouvelle annonce pour le yacht <strong>${boatName}</strong>.</p>
      <p>Cette annonce est en attente de votre validation avant d'être visible par les clients.</p>
      <a href="${APP_URL}/admin/listings" class="btn" style="background:#0a1628">Voir les annonces à valider</a>
    `),
  })
}
