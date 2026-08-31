'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './contact.css';

export default function ContactPage() {
  const [sujet, setSujet] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [pays, setPays] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [consentOk, setConsentOk] = useState(false);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First FAQ open by default
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Highlighting today
  const [today, setToday] = useState('');
  useEffect(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    setToday(days[new Date().getDay()]);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  const handleSubmit = () => {
    if (!sujet) return triggerToast('Veuillez sélectionner un sujet.');
    if (!prenom.trim() || !nom.trim()) return triggerToast('Veuillez renseigner votre prénom et nom.');
    if (!email.trim() || !email.includes('@')) return triggerToast('Veuillez saisir une adresse email valide.');
    if (!message.trim()) return triggerToast('Veuillez saisir votre message.');
    if (!consentOk) return triggerToast('Veuillez accepter la politique de confidentialité.');

    setIsSubmitted(true);
    // call to API would go here (POST /api/contact)
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSujet('');
    setPrenom('');
    setNom('');
    setEmail('');
    setTel('');
    setPays('');
    setBudget('');
    setMessage('');
    setConsentOk(false);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="contact-page-container">
      {/* NAV is usually handled by a global layout, but added here for the standalone preview if needed. 
          Usually we remove this from page.tsx and put it in layout.tsx */}
      
      {/* HERO */}
      <div className="hero">
        <svg className="hero-deco" width="420" height="160" viewBox="0 0 600 200" fill="none">
          <path d="M50 160 L550 160 L480 110 L300 80 L120 110 Z" fill="#b8985a"/>
          <path d="M300 80 L300 20 L200 80 Z" fill="#b8985a"/>
          <path d="M300 80 L300 10 L410 80 Z" fill="#b8985a" opacity=".5"/>
          <line x1="50" y1="160" x2="550" y2="160" stroke="#b8985a" strokeWidth="2"/>
          <path d="M50 168 Q180 178 300 168 Q420 158 550 168" stroke="#b8985a" strokeWidth="1.5" fill="none" opacity=".4"/>
        </svg>
        <div className="hero-inner">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link><span className="sep">/</span>
            <span className="current">Contact</span>
          </div>
          <span className="eyebrow">Nous contacter</span>
          <h1 className="hero-title">Une question ?<br/>Nous sommes <em>à votre écoute</em></h1>
          <p className="hero-sub">
            Notre équipe de conseillers nautiques est disponible <strong>7 jours sur 7</strong> pour vous accompagner dans votre projet de location. Qu'il s'agisse d'une demande de renseignement, d'un projet sur mesure ou d'une assistance technique, nous répondons dans les <strong>meilleurs délais</strong>.
          </p>
        </div>
      </div>

      {/* INFO STRIP */}
      <div className="info-strip">
        <div className="info-item reveal" style={{ animationDelay: '0.05s' }}>
          <div className="info-icon">📧</div>
          <div>
            <div className="info-label">Email</div>
            <div className="info-value">info@voyyacht.com</div>
            <div className="info-sub">Réponse sous 2h ouvrées</div>
          </div>
        </div>
        <div className="info-item reveal" style={{ animationDelay: '0.12s' }}>
          <div className="info-icon">📞</div>
          <div>
            <div className="info-label">Téléphone</div>
            <div className="info-value">+377 97 70 00 00</div>
            <div className="info-sub">Lun–Ven · 9h–19h · Sam 10h–17h</div>
          </div>
        </div>
        <div className="info-item reveal" style={{ animationDelay: '0.19s' }}>
          <div className="info-icon">💬</div>
          <div>
            <div className="info-label">WhatsApp</div>
            <div className="info-value">+377 6 77 00 00 00</div>
            <div className="info-sub">Disponible 7j/7 · 9h–21h</div>
          </div>
        </div>
        <div className="info-item reveal" style={{ animationDelay: '0.26s' }}>
          <div className="info-icon">📍</div>
          <div>
            <div className="info-label">Adresse</div>
            <div className="info-value">3, Quai des Milliardaires</div>
            <div className="info-sub">98000 Monaco · Port Hercule</div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">

        {/* ═══ FORM ═══ */}
        <div className="form-section">
          <span className="section-eyebrow">Formulaire de contact</span>
          <h2 className="section-title">Envoyez-nous<br/>un <em>message</em></h2>
          <p className="section-desc">
            Remplissez le formulaire ci-dessous et un conseiller dédié vous répondra dans les 2 heures ouvrées. Pour les demandes urgentes, privilégiez notre ligne téléphonique ou WhatsApp.
          </p>

          {!isSubmitted ? (
            <div id="contact-form">
              {/* Availability */}
              <div className="availability">
                <div className="avail-dot"></div>
                <span className="avail-text">Notre équipe est disponible en ce moment · Temps de réponse moyen : 5 min</span>
              </div>

              {/* Sujet */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Sujet de votre demande <span className="req">*</span></label>
                <select className="form-select" value={sujet} onChange={(e) => setSujet(e.target.value)}>
                  <option value="">Sélectionner un sujet…</option>
                  <option value="location">Renseignement location</option>
                  <option value="devis">Devis personnalisé</option>
                  <option value="reservation">Problème de réservation</option>
                  <option value="paiement">Problème de paiement</option>
                  <option value="annonceur">Devenir annonceur</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="technique">Assistance technique</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prénom <span className="req">*</span></label>
                  <input className="form-input" type="text" placeholder="Votre prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom <span className="req">*</span></label>
                  <input className="form-input" type="text" placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input className="form-input" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" type="tel" placeholder="+33 6 XX XX XX XX" value={tel} onChange={(e) => setTel(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pays</label>
                  <select className="form-select" value={pays} onChange={(e) => setPays(e.target.value)}>
                    <option value="">Sélectionner…</option>
                    <option>🇫🇷 France</option>
                    <option>🇧🇪 Belgique</option>
                    <option>🇨🇭 Suisse</option>
                    <option>🇱🇺 Luxembourg</option>
                    <option>🇲🇨 Monaco</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Budget estimé</label>
                  <select className="form-select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                    <option value="">Sélectionner…</option>
                    <option>Moins de €2 000 / jour</option>
                    <option>€2 000 – €5 000 / jour</option>
                    <option>€5 000 – €10 000 / jour</option>
                    <option>Plus de €10 000 / jour</option>
                    <option>Pas encore défini</option>
                  </select>
                </div>
              </div>

              <div className="form-row full">
                <div className="form-group">
                  <label className="form-label">Message <span className="req">*</span></label>
                  <textarea className="form-textarea" placeholder="Décrivez votre projet, vos dates envisagées, votre destination idéale…" value={message} onChange={(e) => setMessage(e.target.value.slice(0, 1000))}></textarea>
                  <span className="char-count">{message.length} / 1000</span>
                </div>
              </div>

              {/* Consentement */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', marginBottom: '1.5rem', marginTop: '.25rem' }}>
                <div 
                  className={`consent-box ${consentOk ? 'active' : ''}`}
                  onClick={() => setConsentOk(!consentOk)}
                >
                  {consentOk && <div className="consent-check"></div>}
                </div>
                <label style={{ fontSize: '.78rem', color: 'var(--text-mid)', lineHeight: 1.6, cursor: 'pointer' }} onClick={() => setConsentOk(!consentOk)}>
                  J'accepte que mes données soient utilisées pour traiter ma demande conformément à la <Link href="/legal" style={{ color: 'var(--gold)', textDecoration: 'none' }}>politique de confidentialité</Link> d'VoyYacht.
                </label>
              </div>

              <button className="submit-btn" onClick={handleSubmit}>Envoyer le message</button>
            </div>
          ) : (
            <div className="success-msg" style={{ display: 'block' }}>
              <div className="success-icon">✅</div>
              <div className="success-title">Message envoyé !</div>
              <p className="success-text">
                Merci pour votre message. Un conseiller VoyYacht vous répondra à <strong>{email}</strong> dans les 2 heures ouvrées.<br/><br/>
                En attendant, n'hésitez pas à <Link href="/yachts" style={{ color: 'var(--gold)' }}>parcourir notre flotte</Link> pour trouver le yacht idéal.
              </p>
              <button onClick={resetForm} className="reset-btn">Envoyer un autre message</button>
            </div>
          )}
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <div className="right-sidebar">
          
          {/* FAQ mini */}
          <div className="faq-mini">
            <span className="section-eyebrow">Questions fréquentes</span>
            <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>Les plus <em>posées</em></h3>

            {[
              { q: 'Comment fonctionne la réservation ?', a: 'Choisissez votre yacht, sélectionnez vos dates et soumettez votre demande. Notre équipe valide la réservation sous 24h et vous guide ensuite pour le paiement par Stripe, PayPal ou virement bancaire.' },
              { q: 'Les annonceurs sont-ils vérifiés ?', a: 'Oui, chaque annonceur passe par une vérification d\'identité vidéo (selfie avec pièce d\'identité) validée manuellement par notre équipe. Le badge ✓ Vérifié garantit cette vérification.' },
              { q: 'Puis-je annuler une réservation ?', a: 'Les conditions d\'annulation varient selon la politique définie par chaque annonceur (flexible, modérée ou stricte). Ces informations sont toujours affichées sur la fiche du yacht avant réservation.' },
              { q: 'Comment devenir annonceur sur la plateforme ?', a: 'Créez un compte annonceur, passez la vérification vidéo, puis publiez votre annonce en renseignant toutes les informations de votre yacht. Votre annonce est mise en ligne après validation par notre équipe.' },
              { q: 'Quels modes de paiement sont acceptés ?', a: 'Selon la configuration active de la plateforme : paiement par carte via Stripe, PayPal, ou virement bancaire SEPA / instantané. Le mode disponible est indiqué sur la page de paiement.' }
            ].map((faq, idx) => (
              <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
                <div className="faq-q" onClick={() => toggleFaq(idx)}>
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-arrow">▾</span>
                </div>
                <div className="faq-a">{faq.a}</div>
              </div>
            ))}

            <div style={{ marginTop: '1.1rem' }}>
              <Link href="/faq" className="see-all-faq">Voir toutes les FAQ →</Link>
            </div>
          </div>

          {/* Social */}
          <div className="social-section">
            <span className="section-eyebrow">Retrouvez-nous</span>
            <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Sur les <em>réseaux</em></h3>
            <div className="social-grid">
              <a href="#" className="social-btn">
                <div className="social-icon">📘</div>
                <span className="social-label">Facebook</span>
              </a>
              <a href="#" className="social-btn">
                <div className="social-icon">📸</div>
                <span className="social-label">Instagram</span>
              </a>
              <a href="#" className="social-btn">
                <div className="social-icon">💼</div>
                <span className="social-label">LinkedIn</span>
              </a>
              <a href="#" className="social-btn">
                <div className="social-icon">🐦</div>
                <span className="social-label">X / Twitter</span>
              </a>
            </div>
          </div>

          {/* Horaires */}
          <div className="hours-card">
            <div className="hours-title">Horaires d'ouverture</div>
            {[
              { day: 'Lundi', time: '9h00 – 19h00' },
              { day: 'Mardi', time: '9h00 – 19h00' },
              { day: 'Mercredi', time: '9h00 – 19h00' },
              { day: 'Jeudi', time: '9h00 – 19h00' },
              { day: 'Vendredi', time: '9h00 – 19h00' },
              { day: 'Samedi', time: '10h00 – 17h00' },
              { day: 'Dimanche', time: 'Fermé', closed: true }
            ].map((h, idx) => {
              const isToday = today === h.day;
              return (
                <div key={idx} className={`hours-row ${isToday ? 'today' : ''}`}>
                  <span className="hours-day">{h.day} {isToday && '(aujourd\'hui)'}</span>
                  <span className={`hours-time ${h.closed ? 'closed' : ''}`}>{h.time}</span>
                </div>
              );
            })}
          </div>

          {/* Map */}
          <div className="map-section">
            <div className="map-box">
              <div className="map-pin-large">📍</div>
              <div className="map-name">Port Hercule — Monaco</div>
              <div className="map-coords">43°44'16&quot;N · 7°25'38&quot;E</div>
              <button className="map-cta" onClick={() => triggerToast('Ouverture dans Google Maps…')}>Voir sur la carte</button>
            </div>
          </div>

        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span>{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
