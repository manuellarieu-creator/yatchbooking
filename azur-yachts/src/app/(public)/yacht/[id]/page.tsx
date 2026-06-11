'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './yacht.css';

export default function YachtPage({ params }: { params: { id: string } }) {
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [yacht, setYacht] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchYacht() {
      try {
        const res = await fetch(`/api/listings/${params.id}`);
        const data = await res.json();
        if (data.listing) setYacht(data.listing);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchYacht();
  }, [params.id]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  // ── Lightbox State ──
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const totalPhotos = yacht?.images?.length || 1;

  // ── Description State ──
  const [descExpanded, setDescExpanded] = useState(false);

  // ── Fav ──
  const [isFav, setIsFav] = useState(false);

  // ── Calendar State (Mock) ──
  const [calMonth, setCalMonth] = useState(new Date(2025, 5, 1)); // June 2025
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  // ── Booking Widget State ──
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showGuests, setShowGuests] = useState(false);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [pets, setPets] = useState('non');
  
  const [services, setServices] = useState({
    chef: false,
    snorkeling: false,
    delivery: false
  });

  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  
  const BASE_PRICE = yacht?.price || 0;
  const CLEANING_FEE = yacht?.cleaningFee || 0;

  // ── Review Modal State ──
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);

  // ── Chat State ──
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    { type: 'incoming', text: "Bonjour ! N'hésitez pas si vous avez des questions sur l'Azura Prestige 68.", time: "10:15" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMsgs]);

  // Handle Keyboard for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % totalPhotos);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + totalPhotos) % totalPhotos);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const sendChatMsg = () => {
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMsgs(prev => [...prev, { type: 'outgoing', text: chatInput, time }]);
    setChatInput('');
    
    // Auto-reply
    setTimeout(() => {
      setChatMsgs(prev => [...prev, { type: 'incoming', text: "Je vous remercie pour votre message, je vous réponds dans un instant !", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1500);
  };

  const calcTotal = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    let nights = Math.ceil(diff / (1000 * 3600 * 24));
    if (nights <= 0) return null;

    const base = nights * BASE_PRICE;
    let servTotal = 0;
    if (services.chef) servTotal += 1400; // Mock: assume per week/booking
    if (services.snorkeling) servTotal += 200;
    if (services.delivery) servTotal += 500;

    const subTotal = base + CLEANING_FEE + servTotal;
    const discount = discountApplied ? Math.floor(subTotal * 0.1) : 0;
    const total = subTotal - discount;

    return { nights, base, servTotal, discount, total };
  };

  const totals = calcTotal();

  const applyDiscount = () => {
    const valid = ['BIENVENUE10', 'ETE2025', 'AZUR20'];
    if (valid.includes(discountCode.toUpperCase())) {
      setDiscountApplied(true);
      triggerToast('Code promo appliqué !');
    } else {
      triggerToast('Code promo invalide.');
    }
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      triggerToast('Veuillez sélectionner vos dates de réservation.');
      return;
    }
    
    setBookingLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: yacht.id,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          adults,
          children,
          pets: pets === 'oui',
          specialRequests: '',
          services: [] // On pourrait envoyer les IDs des services ici si mappé
        })
      });

      const data = await res.json();
      if (!res.ok) {
        triggerToast(data.error || 'Erreur lors de la réservation.');
        return;
      }
      
      triggerToast('Réservation pré-approuvée ! Redirection...');
      setTimeout(() => {
        window.location.href = `/payment?bookingId=${data.booking.id}`;
      }, 1500);

    } catch (err) {
      console.error(err);
      triggerToast('Une erreur est survenue.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (isLoading) {
    return <div className="yacht-container" style={{ padding: '100px', textAlign: 'center', color: 'white', fontFamily: 'var(--font-heading)' }}>⚓ Chargement du yacht...</div>;
  }

  if (!yacht) {
    return <div className="yacht-container" style={{ padding: '100px', textAlign: 'center', color: 'white', fontFamily: 'var(--font-heading)' }}>⚓ Yacht introuvable.</div>;
  }

  return (
    <div className="yacht-container">

      {/* ── BREADCRUMB ── */}
      <div className="breadcrumb-bar">
        <Link href="/">Accueil</Link><span className="sep">/</span>
        <a href="#">Les Offres</a><span className="sep">/</span>
        <a href="#">{yacht.country}</a><span className="sep">/</span>
        <span className="current">{yacht.title}</span>
      </div>

      {/* ── GALLERY ── */}
      <div className="gallery">
        <div className="gallery-main" onClick={() => { setLightboxIndex(0); setIsLightboxOpen(true); }}>
          <div className="gallery-bg" style={{ backgroundImage: `url(${yacht.images?.[0]?.url || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          <button className="gallery-share" onClick={(e) => { e.stopPropagation(); triggerToast('Lien copié dans le presse-papiers.'); }}>🔗</button>
          <button className={`gallery-fav ${isFav ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setIsFav(!isFav); }}>{isFav ? '❤️' : '♡'}</button>
          <button className="gallery-more-btn" onClick={(e) => { e.stopPropagation(); setLightboxIndex(0); setIsLightboxOpen(true); }}>📷 Voir les {totalPhotos} photos</button>
        </div>
        <div className="gallery-thumb" onClick={() => { setLightboxIndex(1); setIsLightboxOpen(true); }}>
          <div className="gallery-bg" style={{ backgroundImage: `url(${yacht.images?.[1]?.url || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        </div>
        <div className="gallery-thumb" onClick={() => { setLightboxIndex(2); setIsLightboxOpen(true); }}>
          <div className="gallery-bg" style={{ backgroundImage: `url(${yacht.images?.[2]?.url || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="page-body">
        <div className="left-col">
          {/* Header */}
          <div className="listing-header fade-in">
            <div className="listing-meta-top">
              <span className="listing-location">📍 {yacht.location} — {yacht.country}</span>
              <div className="listing-badges">
                {yacht.owner?.videoVerified && <span className="listing-badge badge-verified">✓ Annonceur vérifié</span>}
                {yacht.owner?.advertiserTier && <span className="listing-badge badge-platinium">⚓ {yacht.owner.advertiserTier}</span>}
              </div>
            </div>
            <h1 className="listing-title">{yacht.title}</h1>
            <div className="listing-quick-stats">
              <span className="quick-stat">👥 <strong>{yacht.maxAdults}</strong> adultes max</span>
              <span className="quick-stat">🛏 <strong>{Math.max(1, Math.floor(yacht.maxAdults/2))}</strong> cabines</span>
              <span className="quick-stat">📏 <strong>{yacht.boatLength} m</strong></span>
              <span className="quick-stat">⏱ <strong>{yacht.maxRentalHours || 24}h</strong> loc. max</span>
              {yacht.requiresCaptain ? <span className="quick-stat">⚓ Captain Required</span> : null}
              {yacht.skipperAvailable ? <span className="quick-stat" style={{ color: 'var(--success)' }}>✓ Skipper disponible</span> : null}
            </div>
          </div>

          <hr className="section-sep" />

          {/* Description */}
          <div className="fade-in">
            <div className="sec-title">À propos de ce yacht</div>
            <div className="description-text">
              {yacht.description}
            </div>
            <button className="read-more-btn" onClick={() => setDescExpanded(!descExpanded)}>
              {descExpanded ? 'Lire moins ▴' : 'Lire la suite ▾'}
            </button>
          </div>

          <hr className="section-sep" />

          {/* Equipment */}
          <div className="fade-in">
            <div className="sec-title">Équipements à bord</div>
            <div className="equip-grid">
              <div className="equip-item"><span className="equip-icon">🧭</span> Pilote automatique</div>
              <div className="equip-item"><span className="equip-icon">🚿</span> Douche de pont</div>
              <div className="equip-item"><span className="equip-icon">⚙️</span> Moteur hors-bord</div>
              <div className="equip-item"><span className="equip-icon">🔥</span> Eau chaude</div>
              <div className="equip-item"><span className="equip-icon">📡</span> GPS & VHF</div>
              <div className="equip-item"><span className="equip-icon">🪑</span> Table de cockpit</div>
              <div className="equip-item"><span className="equip-icon">🎵</span> Système audio</div>
              <div className="equip-item"><span className="equip-icon">📺</span> Écran de navigation</div>
              <div className="equip-item"><span className="equip-icon">⚓</span> Guindeau électrique</div>
            </div>
          </div>

          <hr className="section-sep" />

          {/* Specs */}
          <div className="fade-in">
            <div className="sec-title">Spécifications techniques</div>
            <table className="specs-table">
              <tbody>
                <tr><td>Couple moteur</td><td>111 ft/lb</td></tr>
                <tr><td>Moteur</td><td>Milwaukee-Eight 107</td></tr>
                <tr><td>Système de carburant</td><td>Injection séquentielle ESFI</td></tr>
                <tr><td>Alésage & Course</td><td>3,937 in × 4,375 in</td></tr>
                <tr><td>Infodivertissement</td><td>Boom Box 4.3</td></tr>
                <tr><td>Année de mise en service</td><td>2019</td></tr>
                <tr><td>Longueur</td><td>68 ft / 20,73 m</td></tr>
                <tr><td>Largeur (bau)</td><td>5,80 m</td></tr>
                <tr><td>Tirant d'eau</td><td>1,90 m</td></tr>
              </tbody>
            </table>
          </div>

          <hr className="section-sep" />

          {/* Owner */}
          <div className="fade-in">
            <div className="sec-title">Informations propriétaire</div>
            <div className="owner-card">
              <div className="owner-avatar">FJ</div>
              <div className="owner-info">
                <div className="owner-name">Fabio Jaction</div>
                <div className="owner-stars">★★★★★ <span>(25 avis)</span></div>
                <div className="owner-meta">
                  <div className="owner-meta-item"><strong>Membre depuis</strong> Jan. 2014</div>
                  <div className="owner-meta-item"><strong>Taux de réponse</strong> +85%</div>
                  <div className="owner-meta-item"><strong>Délai de réponse</strong> &lt; 1h</div>
                </div>
                <div className="owner-langs">
                  <span className="lang-chip">🇫🇷 Français</span>
                  <span className="lang-chip">🇬🇧 Anglais</span>
                  <span className="lang-chip">🇮🇹 Italien</span>
                </div>
              </div>
              <button className="msg-btn" onClick={() => setIsChatOpen(true)}>💬 Message</button>
            </div>
          </div>

          <hr className="section-sep" />

          {/* Map */}
          <div className="fade-in">
            <div className="sec-title">Localisation</div>
            <div className="map-placeholder">
              <div className="map-pin">📍</div>
              <div className="map-location">Port de Nice — Côte d'Azur</div>
              <div className="map-label">43°41'39"N · 7°16'22"E<br /><small style={{ fontSize: '.65rem', opacity: .6 }}>Carte interactive disponible avec Leaflet.js en production</small></div>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--text-light)', marginTop: '.6rem' }}>📍 Port Lympia, Quai des États-Unis, 06300 Nice, France</p>
          </div>

          <hr className="section-sep" />

          {/* Calendar */}
          <div className="fade-in">
            <div className="sec-title">Disponibilités</div>
            <div className="cal-header">
              <button className="cal-nav" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}>‹</button>
              <span className="cal-month-title">{monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
              <button className="cal-nav" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}>›</button>
            </div>
            <div className="cal-grid">
              {['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'].map(d => <div key={d} className="cal-dow">{d}</div>)}
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                let cls = 'cal-day available';
                if (day < 5) cls = 'cal-day past';
                if (day > 12 && day < 16) cls = 'cal-day booked';
                if (day === 5) cls += ' today';
                return <div key={i} className={cls}>{day}</div>;
              })}
            </div>
            <div className="cal-legend">
              <div className="cal-leg-item"><div className="cal-leg-dot avail"></div>Disponible</div>
              <div className="cal-leg-item"><div className="cal-leg-dot booked"></div>Réservé</div>
              <div className="cal-leg-item"><div className="cal-leg-dot past"></div>Passé</div>
            </div>
          </div>

          <hr className="section-sep" />

          {/* Reviews */}
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div className="sec-title" style={{ marginBottom: 0 }}>35 Avis</div>
              <button className="add-review-btn" onClick={() => setIsReviewOpen(true)}>+ Laisser un avis</button>
            </div>
            <div className="reviews-overview">
              <div className="reviews-score">
                <div className="score-big">4.5</div>
                <span className="score-stars">★★★★½</span>
                <div className="score-count">35 évaluations</div>
              </div>
              <div className="score-bars">
                <div className="score-bar-row"><span style={{ minWidth: '45px' }}>5 étoiles</span><div className="score-bar-track"><div className="score-bar-fill" style={{ width: '66%' }}></div></div><span>66%</span></div>
                <div className="score-bar-row"><span style={{ minWidth: '45px' }}>4 étoiles</span><div className="score-bar-track"><div className="score-bar-fill" style={{ width: '22%' }}></div></div><span>22%</span></div>
                <div className="score-bar-row"><span style={{ minWidth: '45px' }}>3 étoiles</span><div className="score-bar-track"><div className="score-bar-fill" style={{ width: '8%' }}></div></div><span>8%</span></div>
                <div className="score-bar-row"><span style={{ minWidth: '45px' }}>2 étoiles</span><div className="score-bar-track"><div className="score-bar-fill" style={{ width: '3%' }}></div></div><span>3%</span></div>
                <div className="score-bar-row"><span style={{ minWidth: '45px' }}>1 étoile</span><div className="score-bar-track"><div className="score-bar-fill" style={{ width: '1%' }}></div></div><span>1%</span></div>
              </div>
            </div>
            <div className="review-list">
              <div className="review-item">
                <div className="review-header">
                  <div className="review-avatar">FJ</div>
                  <div className="review-meta">
                    <div className="review-name">Fabio Jaction</div>
                    <div className="review-info">4 oct. 2022 · San Diego, CA</div>
                  </div>
                  <div className="review-stars">★★★★★</div>
                </div>
                <div className="review-text">Le yacht est immaculé, l'équipage aux petits soins. Une semaine absolument magique.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOOKING WIDGET (RIGHT COL) ── */}
        <div className="booking-widget fade-in">
          <div className="widget-header">
            <div className="widget-price-row">
              <div className="widget-price">€{yacht.price.toLocaleString()} <small>/ jour</small></div>
              <div className="widget-rating">
                <span className="widget-star">★</span>
                <span className="widget-rating-val">{yacht.averageRating || 0}</span>
                <span className="widget-rating-count">({yacht._count?.reviews || 0} avis)</span>
              </div>
            </div>
          </div>

          <div className="widget-body">
            <div className="date-grid">
              <div className="date-field">
                <label>Arrivée</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="date-field">
                <label>Départ</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="guests-field" onClick={() => setShowGuests(!showGuests)}>
              <div className="guests-field-label">Invités</div>
              <div className="guests-field-value">
                <span>{adults + children} invités</span>
                <span>▾</span>
              </div>
              {showGuests && (
                <div className="guests-dropdown open" onClick={e => e.stopPropagation()}>
                  <div className="guest-row">
                    <div className="guest-info"><div className="guest-label">Adultes</div><div className="guest-sub">18 ans et plus</div></div>
                    <div className="guest-counter">
                      <button className="counter-btn" onClick={() => setAdults(Math.max(0, adults - 1))} disabled={adults === 0}>−</button>
                      <span className="counter-val">{adults}</span>
                      <button className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button>
                    </div>
                  </div>
                  <div className="guest-row">
                    <div className="guest-info"><div className="guest-label">Enfants</div><div className="guest-sub">1 à 7 ans</div></div>
                    <div className="guest-counter">
                      <button className="counter-btn" onClick={() => setChildren(Math.max(0, children - 1))} disabled={children === 0}>−</button>
                      <span className="counter-val">{children}</span>
                      <button className="counter-btn" onClick={() => setChildren(children + 1)}>+</button>
                    </div>
                  </div>
                  <div className="pets-row">
                    <div className="guest-info"><div className="guest-label">Animaux</div></div>
                    <div className="pets-options">
                      <label className="pet-radio"><input type="radio" name="pets" checked={pets === 'oui'} onChange={() => setPets('oui')} /><span className="pet-radio-dot"></span> Oui</label>
                      <label className="pet-radio"><input type="radio" name="pets" checked={pets === 'non'} onChange={() => setPets('non')} /><span className="pet-radio-dot"></span> Non</label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="services-section">
              <div className="services-title">Services</div>
              <div className="service-item">
                <div className="service-check required"></div>
                <div className="service-info">
                  <div className="service-name required-label">Nettoyage</div>
                  <div className="service-unit">par réservation</div>
                </div>
                <div className="service-price">€350</div>
              </div>
              <div className="service-item" onClick={() => setServices(s => ({ ...s, chef: !s.chef }))}>
                <div className={`service-check ${services.chef ? 'checked' : ''}`}></div>
                <div className="service-info">
                  <div className="service-name">Chef à bord</div>
                  <div className="service-unit">par semaine</div>
                </div>
                <div className="service-price">€1 400</div>
              </div>
              <div className="service-item" onClick={() => setServices(s => ({ ...s, snorkeling: !s.snorkeling }))}>
                <div className={`service-check ${services.snorkeling ? 'checked' : ''}`}></div>
                <div className="service-info">
                  <div className="service-name">Équipement snorkeling</div>
                  <div className="service-unit">par réservation</div>
                </div>
                <div className="service-price">€200</div>
              </div>
            </div>

            <div className="discount-row">
              <input className="discount-input" type="text" placeholder="Code de réduction" value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
              <button className="discount-btn" onClick={applyDiscount}>Appliquer</button>
            </div>
            {discountApplied && <div className="discount-success show">✓ Code appliqué — 10% de réduction</div>}

            {totals && (
              <div className="recap" style={{ display: 'block' }}>
                <div className="recap-row"><span className="label">€{yacht.price.toLocaleString()} × {totals.nights} nuits</span><span className="value">€{totals.base.toLocaleString()}</span></div>
                <div className="recap-row"><span className="label">Nettoyage (obligatoire)</span><span className="value">€{yacht.cleaningFee.toLocaleString()}</span></div>
                {totals.servTotal > 0 && <div className="recap-row"><span className="label">Services additionnels</span><span className="value">€{totals.servTotal.toLocaleString()}</span></div>}
                {discountApplied && <div className="recap-row discount"><span className="label">Réduction (10%)</span><span className="value">−€{totals.discount.toLocaleString()}</span></div>}
                <div className="recap-row total">
                  <span className="label">Total</span>
                  <span className="value">€{totals.total.toLocaleString()}</span>
                </div>
              </div>
            )}

            <button className="reserve-btn" onClick={handleBooking} disabled={bookingLoading}>
              {bookingLoading ? 'Vérification...' : 'Réserver ce yacht'}
            </button>
            <div className="widget-footer-note">Vous ne serez débité qu'après confirmation de votre réservation par notre équipe.</div>
          </div>
        </div>
      </div>

      {/* ── SIMILAR YACHTS ── */}
      <div className="similar-section">
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <div className="similar-title">Bateaux similaires que vous <em>pourriez adorer</em></div>
          <div className="similar-sub">Sélectionnés selon votre destination et vos préférences</div>
          
          <div className="similar-slider-wrap">
            <div className="similar-slider">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="similar-card">
                  <div className="sim-img" style={{ background: `linear-gradient(135deg, var(--navy-mid), var(--navy))` }}></div>
                  <div className="sim-body">
                    <div className="sim-type">Yacht Moteur</div>
                    <div className="sim-name">Liberté Bleue</div>
                    <div className="sim-loc">Cannes, France</div>
                    <div className="sim-footer">
                      <div className="sim-price">€3 200 <small>/ j</small></div>
                      <div className="sim-rating"><span className="star">★</span> 4.8</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="slider-arrow slider-prev">‹</button>
            <button className="slider-arrow slider-next">›</button>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX OVERLAY ── */}
      <div className={`lightbox ${isLightboxOpen ? 'open' : ''}`} onClick={() => setIsLightboxOpen(false)}>
        <button className="lb-close" onClick={() => setIsLightboxOpen(false)}>×</button>
        <div className="lb-bg" onClick={e => e.stopPropagation()} style={{ background: `linear-gradient(135deg, var(--navy-mid), var(--navy))` }}></div>
        <div className="lightbox-controls" onClick={e => e.stopPropagation()}>
          <button className="lb-btn" onClick={() => setLightboxIndex((lightboxIndex - 1 + totalPhotos) % totalPhotos)}>‹</button>
          <span className="lb-counter">{lightboxIndex + 1} / {totalPhotos}</span>
          <button className="lb-btn" onClick={() => setLightboxIndex((lightboxIndex + 1) % totalPhotos)}>›</button>
        </div>
        <div className="lb-thumbnails" onClick={e => e.stopPropagation()}>
          {yacht.images?.map((img: any, i: number) => (
            <div key={i} className={`lb-thumb ${i === lightboxIndex ? 'active' : ''}`} onClick={() => setLightboxIndex(i)} style={{ backgroundImage: `url(${img.url})`, backgroundSize: 'cover' }}></div>
          ))}
        </div>
      </div>

      {/* ── CHAT BUBBLE ── */}
      <div className="chat-bubble">
        <button className="chat-toggle" onClick={() => setIsChatOpen(!isChatOpen)}>💬
          {!isChatOpen && <span className="chat-badge-dot">1</span>}
        </button>
        <div className={`chat-window ${isChatOpen ? 'open' : ''}`}>
          <div className="chat-head">
            <div className="chat-head-avatar">FJ</div>
            <div className="chat-head-info">
              <div className="chat-head-name">Fabio Jaction</div>
              <div className="chat-head-status">En ligne</div>
            </div>
            <button className="chat-head-close" onClick={() => setIsChatOpen(false)}>×</button>
          </div>
          <div className="chat-messages">
            {chatMsgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.type}`}>
                {m.text}
                <span className="chat-msg-time">{m.time}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-row">
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Votre message..." 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && sendChatMsg()} 
            />
            <button className="chat-send" onClick={sendChatMsg}>Envoyer</button>
          </div>
        </div>
      </div>

      {/* ── REVIEW MODAL ── */}
      <div className={`modal-overlay ${isReviewOpen ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-hd">
            <div className="modal-ht">Laisser un avis</div>
            <button className="modal-x" onClick={() => setIsReviewOpen(false)}>×</button>
          </div>
          <div className="modal-bd">
            <div style={{ fontSize: '.85rem', color: 'var(--text-mid)' }}>Comment s'est passée votre expérience à bord du Azura Prestige 68 ?</div>
            <div className="star-selector">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`star-sel ${s <= reviewStars ? 'active' : ''}`} onClick={() => setReviewStars(s)}>★</span>
              ))}
            </div>
            <textarea className="review-textarea" placeholder="Partagez votre expérience..."></textarea>
          </div>
          <div className="modal-ft">
            <button className="modal-btn secondary" onClick={() => setIsReviewOpen(false)}>Annuler</button>
            <button className="modal-btn primary" onClick={() => { triggerToast('Merci pour votre avis !'); setIsReviewOpen(false); }}>Publier l'avis</button>
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
