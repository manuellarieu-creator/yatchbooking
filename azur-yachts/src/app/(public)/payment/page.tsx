'use client';

import { useState, useRef, ChangeEvent, DragEvent, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './payment.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<any>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  
  // Bank transfer state
  const [proofVisible, setProofVisible] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState<'bank' | 'bank_proof' | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [bankSettings, setBankSettings] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/payments/settings')
      .then(res => res.json())
      .then(data => setBankSettings(data))
      .catch(console.error);

    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`)
        .then(res => res.json())
        .then(data => {
          if (data.booking) {
            setBooking(data.booking);
            // Si un paiement est déjà attaché et en attente de preuve, on l'affiche
            if (data.booking.payment && data.booking.payment.status === 'PENDING') {
              setSuccessStatus('bank');
            } else if (data.booking.payment && data.booking.payment.status === 'PROOF_SUBMITTED') {
              setSuccessStatus('bank_proof');
            }
          }
        })
        .finally(() => setLoadingBooking(false));
    } else {
      setLoadingBooking(false);
    }
  }, [bookingId]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      const display = text.length > 20 ? text.slice(0, 20) + '…' : text;
      triggerToast(`"${display}" copié !`);
    });
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProofBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProofBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragover');
  };

  const clearFile = () => {
    setProofFile(null);
    setProofBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Etape 1: Demander les instructions de virement
  const generateBankTransfer = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (data.success) {
        setBooking({ ...booking, payment: data.payment });
        setSuccessStatus('bank');
        triggerToast('✅ Instructions générées. Un email vous a été envoyé.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        triggerToast(`❌ Erreur: ${data.error}`);
      }
    } catch (err) {
      triggerToast('❌ Erreur de connexion');
    }
    setLoading(false);
  };

  // Etape 2: Envoyer la preuve
  const submitProof = async () => {
    if (!proofBase64 || !booking?.payment?.id) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payments/bank-transfer/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: booking.payment.id,
          proofBase64,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessStatus('bank_proof');
        triggerToast('📨 Preuve de virement envoyée à notre équipe !');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        triggerToast(`❌ Erreur: ${data.error}`);
      }
    } catch (err) {
      triggerToast('❌ Erreur de connexion');
    }
    setLoading(false);
  };

  if (loadingBooking) {
    return <div className="payment-page-container"><div style={{padding: '5rem', textAlign: 'center'}}>Chargement de votre réservation...</div></div>;
  }

  if (!booking) {
    return <div className="payment-page-container"><div style={{padding: '5rem', textAlign: 'center'}}>Réservation introuvable ou non autorisée.</div></div>;
  }

  return (
    <div className="payment-page-container">
      {/* NAV */}
      <nav className="pay-nav">
        <button className="nav-back" onClick={() => router.push('/dashboard')}>← Retour au tableau de bord</button>
        <Link href="/" className="nav-logo">VOY<span>YACHT</span></Link>
        <div className="nav-secure">🔒 Paiement sécurisé</div>
      </nav>

      {/* CHECKOUT PROGRESS */}
      <div className="checkout-progress">
        <div className="progress-steps">
          <div className="prog-step">
            <div className="prog-step-wrap">
              <div className="prog-dot done">✓</div>
              <div className="prog-label">Sélection</div>
            </div>
            <div className="prog-line done"></div>
          </div>
          <div className="prog-step">
            <div className="prog-step-wrap">
              <div className="prog-dot done">✓</div>
              <div className="prog-label">Réservation</div>
            </div>
            <div className="prog-line done"></div>
          </div>
          <div className="prog-step">
            <div className="prog-step-wrap">
              <div className="prog-dot active">3</div>
              <div className="prog-label" style={{ color: 'var(--navy)', fontWeight: 500 }}>Paiement</div>
            </div>
            <div className="prog-line"></div>
          </div>
          <div className="prog-step">
            <div className="prog-step-wrap">
              <div className="prog-dot">4</div>
              <div className="prog-label">Confirmation</div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE BODY */}
      <div className="page-body">

        {/* ═══ LEFT COL ═══ */}
        <div className="left-col">

          {/* Bank Transfer Initialization */}
          {!successStatus && (
            <div className="payment-panel active">
              <span className="section-eyebrow">Sélection du mode de paiement</span>
              <h2 className="section-title">Payer par <em>Virement Bancaire</em></h2>

              <p style={{ color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Conformément à vos préférences, le règlement de cette réservation s’effectuera par virement bancaire. 
                Cliquez sur le bouton ci-dessous pour générer votre référence unique et obtenir nos coordonnées bancaires.
              </p>

              <div style={{ background: '#fef8e8', border: '1px solid #f0dca0', borderLeft: '3px solid var(--gold)', padding: '1rem 1.25rem', marginBottom: '2rem', fontSize: '.82rem', color: '#7a5c20', lineHeight: 1.8 }}>
                ⚠️ <strong>Important :</strong> Le paiement par virement bancaire n’est <strong>pas immédiat</strong>. Après votre virement, notre équipe vérifiera manuellement la réception des fonds avant de confirmer votre réservation.<br/>
                📦 <strong>Virement SEPA standard</strong> : confirmation sous <strong>36 à 48 heures</strong><br/>
                ⚡ <strong>Virement instantané</strong> : confirmation sous <strong>30 à 45 minutes</strong>
              </div>

              <button className={`paypal-btn ${loading ? 'loading' : ''}`} style={{ background: 'var(--navy)' }} onClick={generateBankTransfer} disabled={loading}>
                {loading ? 'Génération...' : `Générer les instructions de virement (€${booking.totalPrice.toLocaleString('fr-FR')})`}
              </button>
            </div>
          )}

          {/* Bank Instructions & Upload */}
          {successStatus === 'bank' && (
            <div className="payment-panel active">
              <span className="section-eyebrow">Instructions</span>
              <h2 className="section-title">Coordonnées <em>bancaires</em></h2>

              <div className="bank-hero">
                <span className="bank-hero-icon">✅</span>
                <div className="bank-hero-title">Demande de paiement générée</div>
                <p className="bank-hero-sub">Pour finaliser votre réservation, veuillez effectuer un virement bancaire du montant indiqué ci-dessous en indiquant impérativement la référence unique. <strong>Votre réservation ne sera confirmée qu’après vérification de la réception des fonds par notre équipe.</strong></p>
              </div>

              <div className="bank-details-card">
                <div className="bank-detail-row">
                  <span className="bank-detail-label">Nom du titulaire</span>
                  <span className="bank-detail-value">{bankSettings?.bankAccountName || '-'} <button className="copy-btn" onClick={() => handleCopy(bankSettings?.bankAccountName || '')}>Copier</button></span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-detail-label">IBAN</span>
                  <span className="bank-detail-value">{bankSettings?.bankIban || '-'} <button className="copy-btn" onClick={() => handleCopy(bankSettings?.bankIban || '')}>Copier</button></span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-detail-label">BIC / SWIFT</span>
                  <span className="bank-detail-value">{bankSettings?.bankBic || '-'} <button className="copy-btn" onClick={() => handleCopy(bankSettings?.bankBic || '')}>Copier</button></span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-detail-label">Nom de la banque</span>
                  <span className="bank-detail-value">{bankSettings?.bankName || '-'}</span>
                </div>
              </div>

              <div className="bank-amount-card">
                <div>
                  <div className="bank-amount-lbl">Montant à virer</div>
                  <div className="bank-amount-val">€{booking.totalPrice.toLocaleString('fr-FR')}</div>
                </div>
                <button className="copy-btn" style={{ borderColor: 'rgba(255,255,255,.3)', color: 'rgba(255,255,255,.6)' }} onClick={() => handleCopy(booking.totalPrice.toString())}>Copier</button>
              </div>

              <div className="bank-ref-card">
                <div className="bank-ref-label">Référence à indiquer obligatoirement sur le virement</div>
                <div className="bank-ref-value">
                  {booking.payment?.bankTransferRef}
                  <button className="copy-btn" onClick={() => handleCopy(booking.payment?.bankTransferRef || '')}>Copier</button>
                </div>
              </div>

              <div className="bank-deadline">
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>⏳</span>
                <div className="bank-deadline-text">Vous disposez de <strong>24 heures</strong> pour effectuer le virement et soumettre votre preuve de paiement. Passé ce délai, votre réservation sera automatiquement annulée.</div>
              </div>

              <div style={{ background: 'var(--sand-light)', border: '1px solid var(--sand)', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '.8rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
                ℹ️ <strong>Virement SEPA standard</strong> : délai de confirmation de <strong>36 à 48 heures</strong> après réception de votre preuve.<br/>
                ⚡ <strong>Virement instantané</strong> : délai de confirmation de <strong>30 à 45 minutes</strong>.
              </div>

              <div className="proof-section">
                <div className="proof-title">Preuve de paiement</div>
                <p className="proof-cta-text">Votre paiement est déjà effectué ?</p>
                <a className="proof-cta-link" onClick={() => setProofVisible(!proofVisible)}>
                  <span>{proofVisible ? '▴' : '▾'}</span> Cliquez ici pour joindre l'ordre de virement
                </a>

                <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileSelect} />

                {proofVisible && !proofFile && (
                  <div className="proof-upload-zone" style={{ display: 'block' }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}>
                    <span className="upload-icon">📎</span>
                    <div className="upload-text">Glissez votre fichier ici ou cliquez pour parcourir</div>
                    <div className="upload-hint">PDF, JPG, PNG — 10 Mo maximum</div>
                  </div>
                )}

                {proofFile && (
                  <div className="file-preview" style={{ display: 'flex' }}>
                    <span className="file-preview-icon">📄</span>
                    <span className="file-preview-name">{proofFile.name} ({(proofFile.size / 1024).toFixed(0)} Ko)</span>
                    <button className="file-preview-remove" onClick={clearFile}>✕ Retirer</button>
                  </div>
                )}

                {proofFile && (
                  <button className={`send-proof-btn ${loading ? 'loading' : ''}`} style={{ display: 'block' }} onClick={submitProof} disabled={loading}>
                    {loading ? '⏳ Envoi en cours…' : 'Envoyer la preuve de paiement'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bank Success */}
          {successStatus === 'bank_proof' && (
            <div className="success-screen" style={{ display: 'block', marginTop: '1.25rem' }}>
              <div className="success-checkmark">📨</div>
              <div className="success-title">Preuve envoyée !</div>
              <p className="success-sub">Votre preuve de virement a bien été transmise à notre équipe. <strong>Votre réservation sera confirmée uniquement après vérification de la réception effective des fonds.</strong> La confirmation n’est pas immédiate.<br/><br/>📦 Virement SEPA : 36–48h · ⚡ Virement instantané : 30–45 min</p>
              <div className="success-ref">{booking.payment?.bankTransferRef}</div>
              <div className="success-actions">
                <button className="success-btn success-btn-primary" onClick={() => router.push('/dashboard')}>Voir mes réservations</button>
              </div>
            </div>
          )}

        </div>

        {/* ═══ ORDER SUMMARY ═══ */}
        <div className="order-summary">
          <div className="order-summary-head">
            <div className="order-summary-title">Récapitulatif</div>
            <div className="order-ref">{booking.adminNote?.startsWith('ESSAI') ? "Essai en mer" : booking.totalNights === 0 ? "Achat de navire" : "Réservation"} {booking.id.slice(-6).toUpperCase()}</div>
          </div>
          <div className="order-body">

            <div className="order-yacht">
              <div className="order-yacht-img" style={{ 
                backgroundImage: booking.listing.images?.[0] ? `url(${booking.listing.images[0].url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!booking.listing.images?.[0] && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', opacity: 0.15 }}>⚓</div>}
              </div>
              <div className="order-yacht-info">
                <div className="order-yacht-type">{booking.listing.boatType} · {booking.listing.boatLength}m</div>
                <div className="order-yacht-name">{booking.listing.title}</div>
                <div className="order-yacht-loc">📍 {booking.listing.location}, {booking.listing.country}</div>
              </div>
            </div>

            {booking.totalNights > 0 && (
              <div className="order-dates">
                <div className="order-date-block">
                  <div className="order-date-lbl">Arrivée</div>
                  <div className="order-date-val">{format(new Date(booking.startDate), 'dd MMM yyyy', { locale: fr })}</div>
                </div>
                <div className="order-date-sep">→</div>
                <div className="order-date-block">
                  <div className="order-date-lbl">Départ</div>
                  <div className="order-date-val">{format(new Date(booking.endDate), 'dd MMM yyyy', { locale: fr })}</div>
                </div>
              </div>
            )}

            {booking.totalNights > 0 && (
              <div className="order-guests">👥 {booking.adults} adultes · {booking.children} enfants</div>
            )}

            <div className="recap-rows">
              {booking.totalNights === 0 ? (
                <div className="recap-row"><span className="lbl">{booking.adminNote?.startsWith('ESSAI') ? "Prix de l'essai" : "Prix d'achat (TVA Incluse)"}</span><span className="val">€{booking.basePrice.toLocaleString('fr-FR')}</span></div>
              ) : (
                <div className="recap-row"><span className="lbl">Base ({booking.totalNights} nuits)</span><span className="val">€{booking.basePrice.toLocaleString('fr-FR')}</span></div>
              )}
              
              {booking.totalNights > 0 && (
                <div className="recap-row"><span className="lbl">Frais de nettoyage</span><span className="val">€{booking.cleaningFee.toLocaleString('fr-FR')}</span></div>
              )}
              
              {booking.servicesTotal > 0 && (
                <div className="recap-row"><span className="lbl">Services additionnels</span><span className="val">€{booking.servicesTotal.toLocaleString('fr-FR')}</span></div>
              )}
              {booking.selectedServices?.map((s: any) => (
                <div key={s.id} className="recap-row service"><span className="lbl">— {s.name}</span><span className="val">€{s.price.toLocaleString('fr-FR')}</span></div>
              ))}

              {booking.deliveryFee > 0 && (
                <div className="recap-row service"><span className="lbl">— Livraison au port</span><span className="val">€{booking.deliveryFee.toLocaleString('fr-FR')}</span></div>
              )}

              {booking.discountAmount > 0 && (
                <div className="recap-row discount"><span className="lbl">Code {booking.discountCode}</span><span className="val">−€{booking.discountAmount.toLocaleString('fr-FR')}</span></div>
              )}
            </div>

            <div className="recap-total">
              <span className="recap-total-lbl">Total</span>
              <span className="recap-total-val">€{booking.totalPrice.toLocaleString('fr-FR')}</span>
            </div>

            <div className="order-method-badge">
              <span className="order-method-icon">🏦</span>
              <span>Virement bancaire</span>
            </div>

            <div className="order-guarantee">
              ✅ Toutes les réservations sont validées manuellement par notre équipe avant confirmation. Votre paiement est sécurisé.
            </div>

          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span id="toast-msg">{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="payment-page-container"><div style={{padding: '5rem', textAlign: 'center'}}>Chargement...</div></div>}>
      <PaymentContent />
    </Suspense>
  )
}
