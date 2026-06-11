'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import './payment.css';

type PaymentMode = 'stripe' | 'paypal' | 'bank';

export default function PaymentPage() {
  const [mode, setMode] = useState<PaymentMode>('stripe');
  const [selectedSavedCard, setSelectedSavedCard] = useState<'visa' | 'mc' | null>('visa');
  const [newCardVisible, setNewCardVisible] = useState(false);
  
  // Card form state
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  
  // Bank transfer state
  const [proofVisible, setProofVisible] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState<PaymentMode | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleModeChange = (m: PaymentMode) => {
    setMode(m);
    setSuccessStatus(null);
  };

  const handleCardNumChange = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    v = v.replace(/(.{4})/g, '$1 ').trim();
    setCardNum(v);
  };

  const handleCardExpChange = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
    setCardExp(v);
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5')) return 'MC';
    if (clean.startsWith('3')) return 'AMEX';
    return '—';
  };

  const cardBrand = getCardBrand(cardNum);
  const displayNum = cardNum.replace(/\D/g, '').padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
  const displayExp = cardExp || 'MM/AA';
  const displayHolder = cardHolder.toUpperCase() || 'VOTRE NOM';

  const handleStripePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessStatus('stripe');
      triggerToast('✅ Paiement accepté par Stripe !');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2200);
  };

  const handlePaypalPayment = () => {
    triggerToast('Redirection vers PayPal…');
    setTimeout(() => {
      setSuccessStatus('paypal');
      triggerToast('✅ Paiement PayPal confirmé !');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      const display = text.length > 20 ? text.slice(0, 20) + '…' : text;
      triggerToast(`"${display}" copié !`);
    });
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setProofFile(e.dataTransfer.files[0]);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitProof = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessStatus('bank');
      triggerToast('📨 Preuve de virement envoyée à notre équipe !');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1800);
  };

  const getMethodBadgeText = () => {
    switch (mode) {
      case 'stripe': return '💳 Paiement par carte (Stripe)';
      case 'paypal': return '🅿 Paiement via PayPal';
      case 'bank': return '🏦 Virement bancaire';
    }
  };

  return (
    <div className="payment-page-container">
      {/* NAV */}
      <nav className="pay-nav">
        <button className="nav-back" onClick={() => window.history.back()}>← Retour</button>
        <Link href="/" className="nav-logo">AZUR<span>&nbsp;YACHTS</span></Link>
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

          {/* Demo switcher (simule le choix admin) */}
          <div className="demo-switcher">
            <span className="demo-label">Mode actif (configuré par l'admin) :</span>
            <button className={`demo-btn ${mode === 'stripe' ? 'active' : ''}`} onClick={() => handleModeChange('stripe')}>💳 Stripe</button>
            <button className={`demo-btn ${mode === 'paypal' ? 'active' : ''}`} onClick={() => handleModeChange('paypal')}>🅿 PayPal</button>
            <button className={`demo-btn ${mode === 'bank' ? 'active' : ''}`} onClick={() => handleModeChange('bank')}>🏦 Virement</button>
          </div>

          {/* ══ STRIPE ══ */}
          {mode === 'stripe' && successStatus !== 'stripe' && (
            <div className="payment-panel active">
              <span className="section-eyebrow">Paiement par carte</span>
              <h2 className="section-title">Règlement <em>sécurisé</em></h2>

              <div className="stripe-card">
                <div className="stripe-card-title">Cartes enregistrées</div>
                <div className="saved-cards">
                  <div className={`saved-card-item ${selectedSavedCard === 'visa' ? 'selected' : ''}`} onClick={() => setSelectedSavedCard('visa')}>
                    <div className="saved-card-radio"></div>
                    <div className="saved-card-logo">VISA</div>
                    <div className="saved-card-info">
                      <div className="saved-card-num">Visa •••• •••• •••• 4242</div>
                      <div className="saved-card-exp">Expire 09/27</div>
                    </div>
                    <span className="saved-card-default">Défaut</span>
                  </div>
                  <div className={`saved-card-item ${selectedSavedCard === 'mc' ? 'selected' : ''}`} onClick={() => setSelectedSavedCard('mc')}>
                    <div className="saved-card-radio"></div>
                    <div className="saved-card-logo" style={{ background: 'linear-gradient(135deg,#1a4a6e,#0a2a40)' }}>MC</div>
                    <div className="saved-card-info">
                      <div className="saved-card-num">Mastercard •••• •••• •••• 1137</div>
                      <div className="saved-card-exp">Expire 03/26</div>
                    </div>
                  </div>
                  <div className="new-card-toggle" onClick={() => setNewCardVisible(!newCardVisible)}>
                    <span>{newCardVisible ? '▴' : '▾'}</span> Payer avec une nouvelle carte
                  </div>
                </div>

                {/* New card form */}
                {newCardVisible && (
                  <div>
                    <div className="card-preview">
                      <div className="card-chip"></div>
                      <div className="card-number-display">{displayNum}</div>
                      <div className="card-bottom">
                        <div>
                          <div className="card-holder-lbl">Titulaire</div>
                          <div className="card-holder-val">{displayHolder}</div>
                        </div>
                        <div>
                          <div className="card-expiry-lbl">Expire</div>
                          <div className="card-expiry-val">{displayExp}</div>
                        </div>
                      </div>
                      <div className="card-brand">{cardBrand}</div>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Numéro de carte <span className="req">*</span></label>
                      <div className="card-input-wrap">
                        <input className="form-input" type="text" value={cardNum} onChange={handleCardNumChange} placeholder="1234 5678 9012 3456" maxLength={19} />
                        <div className="card-type-badge">{cardBrand}</div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field" style={{ marginBottom: 0 }}>
                        <label className="form-label">Date d'expiration <span className="req">*</span></label>
                        <input className="form-input" type="text" value={cardExp} onChange={handleCardExpChange} placeholder="MM/AA" maxLength={5} />
                      </div>
                      <div className="form-field" style={{ marginBottom: 0 }}>
                        <label className="form-label">CVC <span className="req">*</span></label>
                        <input className="form-input" type="text" value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g,''))} placeholder="123" maxLength={4} />
                      </div>
                    </div>
                    <div className="form-field" style={{ marginTop: '1.1rem' }}>
                      <label className="form-label">Nom du titulaire <span className="req">*</span></label>
                      <input className="form-input" type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="JEAN DUPONT" />
                    </div>
                  </div>
                )}

                <div className="security-badges">
                  <div className="sec-badge">🔒 <strong>SSL 256-bit</strong></div>
                  <div className="sec-badge">✅ <strong>PCI-DSS</strong> Niveau 1</div>
                  <div className="sec-badge">🛡 <strong>3D Secure</strong></div>
                  <div className="sec-badge">💳 Visa · Mastercard · Amex</div>
                </div>
              </div>

              <button className={`pay-btn ${loading ? 'loading' : ''}`} onClick={handleStripePayment} disabled={loading}>
                Payer €34 200
                <div className="pay-btn-loader"><div className="spinner"></div></div>
              </button>
              <p className="pay-footnote">🔒 Vos données bancaires sont chiffrées et traitées par Stripe. Azur Yachts ne stocke jamais vos informations de carte.</p>
            </div>
          )}

          {/* Stripe Success */}
          {successStatus === 'stripe' && (
            <div className="success-screen" style={{ display: 'block' }}>
              <div className="success-checkmark">✅</div>
              <div className="success-title">Paiement accepté !</div>
              <p className="success-sub">Votre paiement de <strong>€34 200</strong> a bien été reçu. Votre réservation est en cours de validation par notre équipe. Vous recevrez un email de confirmation sous 24h.</p>
              <div className="success-ref">REF-CK7X9M</div>
              <div className="success-actions">
                <button className="success-btn success-btn-primary" onClick={() => triggerToast('Redirection vers vos réservations…')}>Voir mes réservations</button>
                <button className="success-btn success-btn-outline" onClick={() => triggerToast('Retour à l\'accueil…')}>Retour à l'accueil</button>
              </div>
            </div>
          )}

          {/* ══ PAYPAL ══ */}
          {mode === 'paypal' && successStatus !== 'paypal' && (
            <div className="payment-panel active">
              <span className="section-eyebrow">Paiement PayPal</span>
              <h2 className="section-title">Payer via <em>PayPal</em></h2>

              <div className="paypal-card">
                <span className="paypal-logo">🅿</span>
                <div className="paypal-title">Payer avec PayPal</div>
                <p className="paypal-desc">Vous serez redirigé vers PayPal pour finaliser votre paiement en toute sécurité. Votre compte PayPal est déjà associé à votre profil Azur Yachts.</p>

                <div className="paypal-account-preview">
                  <div className="paypal-av">🅿</div>
                  <div className="paypal-account-info">
                    <div className="paypal-account-name">Jean Dupont</div>
                    <div className="paypal-account-email">jean.dupont@gmail.com</div>
                  </div>
                  <span className="paypal-account-linked">✓ Lié</span>
                </div>

                <button className="paypal-btn" onClick={handlePaypalPayment}>
                  <span className="paypal-btn-icon">🅿</span>
                  Payer €34 200 avec PayPal
                </button>
                <div className="paypal-or">— ou —</div>
                <p className="paypal-alt">Vous pouvez également payer avec votre carte via PayPal sans avoir de compte.<br/>Protection acheteur PayPal incluse.</p>
              </div>
            </div>
          )}

          {/* Paypal Success */}
          {successStatus === 'paypal' && (
            <div className="success-screen" style={{ display: 'block' }}>
              <div className="success-checkmark">✅</div>
              <div className="success-title">Paiement PayPal accepté !</div>
              <p className="success-sub">Votre paiement de <strong>€34 200</strong> via PayPal a bien été capturé. Votre réservation est en cours de validation par notre équipe.</p>
              <div className="success-ref">REF-CK7X9M</div>
              <div className="success-actions">
                <button className="success-btn success-btn-primary" onClick={() => triggerToast('Redirection…')}>Voir mes réservations</button>
                <button className="success-btn success-btn-outline" onClick={() => triggerToast('Retour…')}>Retour à l'accueil</button>
              </div>
            </div>
          )}

          {/* ══ BANK TRANSFER ══ */}
          {mode === 'bank' && successStatus !== 'bank' && (
            <div className="payment-panel active">
              <span className="section-eyebrow">Virement bancaire</span>
              <h2 className="section-title">Coordonnées <em>bancaires</em></h2>

              <div className="bank-hero">
                <span className="bank-hero-icon">✅</span>
                <div className="bank-hero-title">Demande de réservation envoyée</div>
                <p className="bank-hero-sub">Pour finaliser votre réservation, veuillez effectuer un virement bancaire du montant indiqué ci-dessous avec la référence obligatoire.</p>
              </div>

              <div className="bank-details-card">
                <div className="bank-detail-row">
                  <span className="bank-detail-label">Nom du titulaire</span>
                  <span className="bank-detail-value">Azur Yachts SAM <button className="copy-btn" onClick={() => handleCopy('Azur Yachts SAM')}>Copier</button></span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-detail-label">IBAN</span>
                  <span className="bank-detail-value">MC93 1234 5678 9012 3456 7890 123 <button className="copy-btn" onClick={() => handleCopy('MC93 1234 5678 9012 3456 7890 123')}>Copier</button></span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-detail-label">BIC / SWIFT</span>
                  <span className="bank-detail-value">CMCIMC2A <button className="copy-btn" onClick={() => handleCopy('CMCIMC2A')}>Copier</button></span>
                </div>
                <div className="bank-detail-row">
                  <span className="bank-detail-label">Nom de la banque</span>
                  <span className="bank-detail-value">Crédit Mutuel Monaco</span>
                </div>
              </div>

              <div className="bank-amount-card">
                <div>
                  <div className="bank-amount-lbl">Montant à virer</div>
                  <div className="bank-amount-val">€34 200,00</div>
                </div>
                <button className="copy-btn" style={{ borderColor: 'rgba(255,255,255,.3)', color: 'rgba(255,255,255,.6)' }} onClick={() => handleCopy('34200.00')}>Copier</button>
              </div>

              <div className="bank-ref-card">
                <div className="bank-ref-label">Référence à indiquer obligatoirement sur le virement</div>
                <div className="bank-ref-value">
                  REF-CK7X9M
                  <button className="copy-btn" onClick={() => handleCopy('REF-CK7X9M')}>Copier</button>
                </div>
              </div>

              <div className="bank-deadline">
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>⏳</span>
                <div className="bank-deadline-text">Vous disposez de <strong>24 heures</strong> pour effectuer le virement et soumettre votre preuve de paiement. Passé ce délai, votre réservation sera automatiquement annulée.</div>
              </div>

              <div className="relance-timeline">
                <div className="relance-title">Calendrier des relances automatiques</div>
                <div className="relance-items">
                  <div className="relance-item"><div className="relance-dot gold"></div><div className="relance-text"><strong>T+1h</strong> — 1ère relance email si aucune preuve soumise</div></div>
                  <div className="relance-item"><div className="relance-dot orange"></div><div className="relance-text"><strong>T+3h</strong> — 2ème relance email (dernière relance)</div></div>
                  <div className="relance-item"><div className="relance-dot red"></div><div className="relance-text"><strong>T+24h</strong> — Annulation automatique si aucun paiement reçu</div></div>
                </div>
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
          {successStatus === 'bank' && (
            <div className="success-screen" style={{ display: 'block', marginTop: '1.25rem' }}>
              <div className="success-checkmark">📨</div>
              <div className="success-title">Preuve envoyée !</div>
              <p className="success-sub">Votre preuve de virement a bien été transmise à notre équipe. Votre réservation sera confirmée après vérification.<br/><br/>Virement SEPA : 36–48h · Virement instantané : 30–45 min</p>
              <div className="success-ref">REF-CK7X9M</div>
              <div className="success-actions">
                <button className="success-btn success-btn-primary" onClick={() => triggerToast('Redirection…')}>Voir mes réservations</button>
              </div>
            </div>
          )}

        </div>

        {/* ═══ ORDER SUMMARY ═══ */}
        <div className="order-summary">
          <div className="order-summary-head">
            <div className="order-summary-title">Récapitulatif</div>
            <div className="order-ref">Réservation REF-CK7X9M</div>
          </div>
          <div className="order-body">

            <div className="order-yacht">
              <div className="order-yacht-img"></div>
              <div className="order-yacht-info">
                <div className="order-yacht-type">Superyacht · Motor · Platinium</div>
                <div className="order-yacht-name">Azura Prestige 68</div>
                <div className="order-yacht-loc">📍 Nice, Côte d'Azur — France</div>
              </div>
            </div>

            <div className="order-dates">
              <div className="order-date-block">
                <div className="order-date-lbl">Arrivée</div>
                <div className="order-date-val">14 juin 2025</div>
              </div>
              <div className="order-date-sep">→</div>
              <div className="order-date-block">
                <div className="order-date-lbl">Départ</div>
                <div className="order-date-val">21 juin 2025</div>
              </div>
            </div>

            <div className="order-guests">👥 4 adultes · 2 enfants</div>

            <div className="recap-rows">
              <div className="recap-row"><span className="lbl">€4 800 × 7 nuits</span><span className="val">€33 600</span></div>
              <div className="recap-row"><span className="lbl">Frais de nettoyage</span><span className="val">€350</span></div>
              <div className="recap-row"><span className="lbl">Services</span><span className="val">€1 900</span></div>
              <div className="recap-row service"><span className="lbl">— Chef à bord (7j)</span><span className="val">€1 400</span></div>
              <div className="recap-row service"><span className="lbl">— Équipement snorkeling</span><span className="val">€200</span></div>
              <div className="recap-row service"><span className="lbl">— Livraison port souhaité</span><span className="val">€300</span></div>
              <div className="recap-row discount"><span className="lbl">Code BIENVENUE10 (−10%)</span><span className="val">−€1 650</span></div>
            </div>

            <div className="recap-total">
              <span className="recap-total-lbl">Total</span>
              <span className="recap-total-val">€34 200</span>
            </div>

            <div className="order-method-badge">
              <span className="order-method-icon">💳</span>
              <span>{getMethodBadgeText()}</span>
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
