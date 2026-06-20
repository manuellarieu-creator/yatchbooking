'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { 
  Umbrella, ShowerHead, Grid2X2, Speaker, Waves, 
  Thermometer, Droplets, Snowflake, Bath, Plug, 
  Navigation, Anchor, Cpu, Compass, Radio, 
  Flame, Coffee, Video, Music, Sun, Sailboat, 
  Zap, SunMedium, Shield, Wifi, Check 
} from 'lucide-react';
import './yacht.css';

const EQUIPMENT_CATEGORIES: Record<string, string[]> = {
  "ÉQUIPEMENTS EXTÉRIEURS": ["Taud de soleil", "Douche de pont", "Douche extérieure", "Table extérieure", "Table de cockpit", "Enceintes extérieures", "Pont en teck", "Échelle de bain", "Filet de sécurité"],
  "CONFORT": ["Eau chaude", "Dessalinisateur", "Air conditionné", "Climatisation", "WC électrique", "Serviettes de bain", "Prise USB", "Wi-Fi"],
  "ÉQUIPEMENTS NAVIGATION": ["Annexe", "Guindeau électrique", "Pilote automatique", "GPS", "VHF", "GPS & VHF", "Écran de navigation", "Propulseur d'étrave"],
  "CUISINE": ["Four/cuisinière", "Machine à café", "Cuisine équipée"],
  "LOISIRS": ["Caméra vidéo", "Système audio", "Paddle", "Canoë-kayak", "Bain de soleil"],
  "VOILES & GRÉEMENT": ["Grand-voile lattée", "Génois"],
  "ÉNERGIE À BORD": ["Générateur", "Panneaux solaires", "Inverseur électrique", "Prise 220V"],
  "SPORTS NAUTIQUES": ["Ski nautique", "Moteur hors-bord"]
};

const getIconForEquipment = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('taud')) return <Umbrella className="w-4 h-4" />;
  if (n.includes('douche')) return <ShowerHead className="w-4 h-4" />;
  if (n.includes('table')) return <Grid2X2 className="w-4 h-4" />;
  if (n.includes('enceinte') || n.includes('audio')) return <Speaker className="w-4 h-4" />;
  if (n.includes('teck') || n.includes('échelle') || n.includes('paddle') || n.includes('ski nautique') || n.includes('canoë')) return <Waves className="w-4 h-4" />;
  if (n.includes('eau chaude')) return <Thermometer className="w-4 h-4" />;
  if (n.includes('dessalinisateur') || n.includes('wc')) return <Droplets className="w-4 h-4" />;
  if (n.includes('air cond') || n.includes('climatisation')) return <Snowflake className="w-4 h-4" />;
  if (n.includes('serviette')) return <Bath className="w-4 h-4" />;
  if (n.includes('prise') || n.includes('inverseur')) return <Plug className="w-4 h-4" />;
  if (n.includes('annexe') || n.includes('navigation')) return <Navigation className="w-4 h-4" />;
  if (n.includes('guindeau')) return <Anchor className="w-4 h-4" />;
  if (n.includes('pilote')) return <Cpu className="w-4 h-4" />;
  if (n.includes('gps')) return <Compass className="w-4 h-4" />;
  if (n.includes('vhf')) return <Radio className="w-4 h-4" />;
  if (n.includes('four') || n.includes('cuisine')) return <Flame className="w-4 h-4" />;
  if (n.includes('café')) return <Coffee className="w-4 h-4" />;
  if (n.includes('caméra') || n.includes('video')) return <Video className="w-4 h-4" />;
  if (n.includes('bain de soleil') || n.includes('solaire')) return <Sun className="w-4 h-4" />;
  if (n.includes('voile') || n.includes('génois')) return <Sailboat className="w-4 h-4" />;
  if (n.includes('générateur')) return <Zap className="w-4 h-4" />;
  if (n.includes('filet')) return <Shield className="w-4 h-4" />;
  if (n.includes('wi-fi') || n.includes('wifi')) return <Wifi className="w-4 h-4" />;
  return <Check className="w-4 h-4" />;
};

export default function YachtPage({ params }: { params: { id: string } }) {
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [yacht, setYacht] = useState<any>(null);
  const [similarYachts, setSimilarYachts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchYacht() {
      try {
        const res = await fetch(`/api/listings/${params.id}`);
        const data = await res.json();
        if (data.listing) setYacht(data.listing);
        if (data.similar) setSimilarYachts(data.similar);
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
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  
  const [withCaptain, setWithCaptain] = useState(false);
  const [withSkipper, setWithSkipper] = useState(false);
  

  // ── Review Modal State ──
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewType, setReviewType] = useState<'SITE' | 'OWNER' | 'LISTING'>('LISTING');
  const [isListingReviewsModalOpen, setIsListingReviewsModalOpen] = useState(false);

  // ── Chat State ──
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    { type: 'incoming', text: `Bonjour ! N'hésitez pas si vous avez des questions sur le ${yacht?.title || 'bateau'}.`, time: "10:15" }
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

    const base = nights * yacht.price;
    let servTotal = 0;
    selectedServiceIds.forEach(id => {
      const s = yacht.services?.find((x: any) => x.id === id);
      if (s) {
        const price = Number(s.price) || 0;
        if (s.unit === 'PER_BOOKING') servTotal += price;
        else if (s.unit === 'PER_DAY') servTotal += price * nights;
        else if (s.unit === 'PER_PERSON') servTotal += price * Math.max(1, adults + children);
        else servTotal += price; // Fallback
      }
    });

    if (withCaptain && yacht.captainPrice) servTotal += yacht.captainPrice * nights;
    if (withSkipper && yacht.skipperPrice) servTotal += yacht.skipperPrice * nights;

    const subTotal = base + yacht.cleaningFee + servTotal;
    
    // Automatic discounts
    let discountPercent = 0;
    if (nights >= 14) discountPercent = 0.10; // 10% pour 2 semaines
    else if (nights >= 7) discountPercent = 0.07; // 7% pour 1 semaine
    else if (discountApplied) discountPercent = 0.10; // Promo code (keep existing logic)

    const discount = Math.floor(subTotal * discountPercent);
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

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submitReview = async () => {
    if (reviewStars === 0 || !reviewComment.trim()) {
      triggerToast('Veuillez donner une note et un commentaire.');
      return;
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId: yacht.id, 
          targetUserId: yacht.ownerId,
          targetType: reviewType,
          rating: reviewStars, 
          comment: reviewComment 
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast('Merci ! Votre avis est soumis et en attente de modération.');
        setIsReviewOpen(false);
        setReviewStars(0);
        setReviewComment('');
      } else {
        triggerToast(data.error || 'Erreur lors de la soumission de l\'avis.');
      }
    } catch (e) {
      triggerToast('Erreur réseau.');
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
          selectedServicesIds: selectedServiceIds,
          withCaptain,
          withSkipper
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
          <div className="gallery-bg" style={{ backgroundImage: `url(${yacht.images?.[0]?.url || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          <button className="gallery-share" onClick={(e) => { e.stopPropagation(); triggerToast('Lien copié dans le presse-papiers.'); }}>🔗</button>
          <button className={`gallery-fav ${isFav ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setIsFav(!isFav); }}>{isFav ? '❤️' : '♡'}</button>
          <button className="gallery-more-btn" onClick={(e) => { e.stopPropagation(); setLightboxIndex(0); setIsLightboxOpen(true); }}>📷 Voir les {totalPhotos} photos</button>
        </div>
        <div className="gallery-thumb" onClick={() => { setLightboxIndex(1); setIsLightboxOpen(true); }}>
          <div className="gallery-bg" style={{ backgroundImage: `url(${yacht.images?.[1]?.url || 'https://images.unsplash.com/photo-1605281317010-52c286e7a2b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        </div>
        <div className="gallery-thumb" onClick={() => { setLightboxIndex(2); setIsLightboxOpen(true); }}>
          <div className="gallery-bg" style={{ backgroundImage: `url(${yacht.images?.[2]?.url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="page-body">
        <div className="left-col">
          {/* Header */}
          <div className="listing-header fade-in">
            <div className="listing-meta-top" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="listing-location" style={{ fontWeight: 500 }}>🚤 {yacht.boatType}</span>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></div>
              <span className="listing-location">📍 {yacht.location} — {yacht.country}</span>
              <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
              <Link href={`/profile/${yacht.ownerId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', cursor: 'pointer' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                  {yacht.owner?.avatar ? (
                    <img src={yacht.owner.avatar} alt="Owner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--gold)', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
                      {yacht.owner?.firstName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {yacht.owner?.firstName} {yacht.owner?.lastName}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, backgroundColor: 'rgba(21, 62, 92, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  {yacht.owner?.role === 'ADVERTISER' ? 'Pro' : 'Particulier'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem', color: 'var(--text-mid)' }}>
                  <span style={{ color: 'var(--gold)' }}>★</span>
                  {yacht.owner?.averageRating || 0} ({yacht.owner?.reviewCount || 0})
                </span>
                {yacht.owner?.languages && yacht.owner.languages.length > 0 && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>🗣️</span> {yacht.owner.languages.map((l: string) => l.substring(0, 2).toUpperCase()).join(', ')}
                  </span>
                )}
              </Link>
              <div className="listing-badges" style={{ marginLeft: 'auto' }}>
                {yacht.owner?.videoVerified && <span className="listing-badge badge-verified">✓ Vérifié</span>}
                {yacht.owner?.advertiserTier && <span className="listing-badge badge-platinium">⚓ {yacht.owner.advertiserTier}</span>}
              </div>
            </div>
            {yacht.isAtSea && (
              <div style={{ backgroundColor: 'rgba(230, 150, 0, 0.1)', border: '1px solid rgba(230, 150, 0, 0.4)', borderRadius: '8px', padding: '0.8rem 1rem', marginTop: '0.5rem', marginBottom: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                <div>
                  <strong style={{ color: 'rgba(210, 130, 0, 1)', display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Bateau en déplacement</strong>
                  <p style={{ color: 'var(--text-mid)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                    Ce yacht est actuellement en mer ou dans un port différent de son port d'attache ({yacht.location}). Des frais ou un délai de convoyage peuvent s'appliquer selon votre port de départ souhaité.
                  </p>
                </div>
              </div>
            )}
            <div 
              onClick={() => yacht.reviewCount > 0 && setIsListingReviewsModalOpen(true)} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', cursor: yacht.reviewCount > 0 ? 'pointer' : 'default', textDecoration: yacht.reviewCount > 0 ? 'underline' : 'none', color: 'var(--text-mid)', fontSize: '0.95rem' }}
            >
              <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>★</span>
              <strong style={{ color: 'var(--text)' }}>{yacht.averageRating > 0 ? yacht.averageRating : 'Nouveau'}</strong>
              {yacht.reviewCount > 0 && <span>({yacht.reviewCount} avis)</span>}
            </div>
            <h1 className="listing-title">{yacht.title}</h1>
            <div className="listing-quick-stats">
              <span className="quick-stat">👥 <strong>{yacht.maxAdults}</strong> adultes max</span>
              {yacht.cabins ? <span className="quick-stat">🛏 <strong>{yacht.cabins}</strong> cabines</span> : null}
              <span className="quick-stat">📏 <strong>{yacht.boatLength} m</strong></span>
              <span className="quick-stat">⏱ <strong>{yacht.maxRentalHours || 24}h</strong> loc. max</span>
              {yacht.requiresCaptain && <span className="quick-stat">⚓ Captain Required {yacht.captainPrice ? `(+${formatPrice(yacht.captainPrice)}/j)` : ''}</span>}
              {yacht.skipperAvailable && <span className="quick-stat" style={{ color: 'var(--success)' }}>✓ Skipper dispo {yacht.skipperPrice ? `(+${formatPrice(yacht.skipperPrice)}/j)` : ''}</span>}
              <span className="quick-stat">⛽ <strong>{yacht.fuelIncluded ? 'Carburant inclus' : 'Carburant non inclus'}</strong></span>
            </div>
          </div>

          <hr className="section-sep" />

          {/* Boat Plans */}
          {(yacht.boatPlanUrls?.length > 0 || yacht.berths || yacht.bathrooms) && (
            <div className="fade-in">
              <div className="sec-title">Plans du bateau</div>
              <div className="boat-plan-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {yacht.boatPlanUrls && yacht.boatPlanUrls.length > 0 ? (
                  <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {yacht.boatPlanUrls.map((url: string, idx: number) => (
                      <div key={idx} className="boat-plan-image-wrapper" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '1rem', background: '#fff' }}>
                        <img src={url} alt={`Plan du bateau ${idx + 1}`} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="boat-plan-image-wrapper" style={{ flex: '1 1 400px', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '3rem 1rem', background: '#f9f9f9', textAlign: 'center', color: '#888' }}>
                    Plan non disponible
                  </div>
                )}

                <div className="boat-plan-info" style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem', color: '#333' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>👥</span>
                    <span>{yacht.maxAdults + yacht.maxChildren} personnes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>🚪</span>
                    <span>{yacht.cabins || '-'} cabines</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>🛏</span>
                    <span>{yacht.berths || '-'} couchages</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>🚿</span>
                    <span>{yacht.bathrooms || '-'} salles de bain</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            <div className="sec-title">Équipements</div>
            <p style={{ color: 'var(--text-mid)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Découvrez tous les équipements présents à bord de ce bateau.</p>
            
            {(() => {
              const groupedFeatures: Record<string, string[]> = {};
              let hasFeatures = false;
              if (yacht.features && yacht.features.length > 0) {
                hasFeatures = true;
                yacht.features.forEach((f: string) => {
                  let catFound = "AUTRES";
                  for (const [cat, items] of Object.entries(EQUIPMENT_CATEGORIES)) {
                    if (items.includes(f)) {
                      catFound = cat;
                      break;
                    }
                  }
                  if (!groupedFeatures[catFound]) groupedFeatures[catFound] = [];
                  groupedFeatures[catFound].push(f);
                });
              }

              const groupedServices: Record<string, any[]> = {};
              let hasServices = false;
              if (yacht.services && yacht.services.length > 0) {
                const optionalServices = yacht.services.filter((s: any) => !s.isRequired);
                if (optionalServices.length > 0) {
                  hasServices = true;
                  optionalServices.forEach((s: any) => {
                    let catFound = "AUTRES";
                    for (const [cat, items] of Object.entries(EQUIPMENT_CATEGORIES)) {
                      if (items.some(item => item.toLowerCase() === s.name.toLowerCase())) {
                        catFound = cat;
                        break;
                      }
                    }
                    if (!groupedServices[catFound]) groupedServices[catFound] = [];
                    groupedServices[catFound].push(s);
                  });
                }
              }

              if (!hasFeatures && !hasServices) {
                return <p style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.9rem' }}>Aucun équipement renseigné pour le moment.</p>;
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {hasFeatures && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem' }}>À bord</h3>
                      {Object.entries(groupedFeatures).map(([cat, items]) => (
                        <div key={cat} style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em', marginBottom: '0.8rem' }}>{cat}</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
                            {items.map(item => (
                              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--text-light)', display: 'flex' }}>{getIconForEquipment(item)}</span>
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasServices && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem' }}>En option</h3>
                      {Object.entries(groupedServices).map(([cat, items]) => (
                        <div key={cat} style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em', marginBottom: '0.8rem' }}>{cat}</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
                            {items.map(s => (
                              <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--text-light)', display: 'flex', marginTop: '0.2rem' }}>{getIconForEquipment(s.name)}</span>
                                <div>
                                  <div>{s.name}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{s.price} € / {s.unit === 'PER_DAY' ? 'jour' : s.unit === 'PER_BOOKING' ? 'réservation' : 'personne'}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <hr className="section-sep" />

          {/* Specs */}
          <div className="fade-in">
            <div className="sec-title">Spécifications techniques</div>
            <table className="specs-table">
              <tbody>
                <tr><td>Type</td><td>{yacht.boatType || '-'}</td></tr>
                <tr><td>Année</td><td>{yacht.boatYear || '-'}</td></tr>
                <tr><td>Longueur</td><td>{yacht.boatLength ? `${yacht.boatLength} m` : '-'}</td></tr>
                <tr><td>Capacité adultes</td><td>{yacht.maxAdults || '-'}</td></tr>
                <tr><td>Capacité enfants</td><td>{yacht.maxChildren || '0'}</td></tr>
                <tr><td>Location max</td><td>{yacht.maxRentalHours ? `${yacht.maxRentalHours} heures` : 'Sans limite'}</td></tr>
                <tr><td>Carburant</td><td>{yacht.fuelIncluded ? 'Inclus' : 'Non inclus'}</td></tr>
                <tr><td>Frais de nettoyage</td><td>{yacht.cleaningFee ? formatPrice(yacht.cleaningFee) : 'Inclus'}</td></tr>
                <tr><td>Livraison disponible</td><td>{yacht.deliveryAvailable ? `Oui (${formatPrice(yacht.deliveryFee || 0)})` : 'Non'}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Owner */}
          <div className="fade-in">
            <div className="sec-title">Informations propriétaire</div>
            <div className="owner-card">
              <Link href={`/profile/${yacht.owner?.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="owner-avatar">
                  {yacht.owner?.avatar ? (
                    <img src={yacht.owner.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    (yacht.owner?.firstName?.charAt(0) || '') + (yacht.owner?.lastName?.charAt(0) || '')
                  )}
                </div>
              </Link>
              <div className="owner-info">
                <Link href={`/profile/${yacht.owner?.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="owner-name">{yacht.owner?.firstName} {yacht.owner?.lastName}</div>
                </Link>
                <div className="owner-stars">
                  {(() => {
                    const revs = yacht.owner?.receivedReviews || [];
                    const avg = revs.length ? (revs.reduce((a:any, b:any) => a + b.rating, 0) / revs.length).toFixed(1) : 0;
                    return Number(avg) > 0 ? (
                      <>
                        {'★'.repeat(Math.round(Number(avg)))} <span>({revs.length} avis propriétaire)</span>
                      </>
                    ) : 'Nouveau propriétaire';
                  })()}
                </div>
                <div className="owner-meta">
                  <div className="owner-meta-item"><strong>Membre depuis</strong> {yacht.owner?.createdAt ? new Date(yacht.owner.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Récent'}</div>
                  <div className="owner-meta-item"><strong>Taux de réponse</strong> +85%</div>
                  <div className="owner-meta-item"><strong>Délai de réponse</strong> &lt; 1h</div>
                </div>
                {yacht.owner?.languages && yacht.owner.languages.length > 0 && (
                  <div className="owner-langs">
                    {yacht.owner.languages.map((lang: string, i: number) => (
                      <span key={i} className="lang-chip">{lang}</span>
                    ))}
                  </div>
                )}
              </div>
              <button className="msg-btn" onClick={() => setIsChatOpen(true)}>💬 Message</button>
            </div>
            
            {/* Owner Reviews */}
            {yacht.owner?.receivedReviews?.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Avis sur {yacht.owner.firstName}</h4>
                <div className="review-list" style={{ gap: '1rem' }}>
                  {yacht.owner.receivedReviews.map((rev: any) => (
                    <div key={rev.id} className="review-item" style={{ padding: '1rem', background: '#fcfcfc', border: '1px solid var(--sand)', borderRadius: '8px' }}>
                      <div className="review-header">
                        <div className="review-avatar" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>{rev.author?.firstName?.charAt(0) || 'U'}</div>
                        <div className="review-meta">
                          <div className="review-name" style={{ fontSize: '0.9rem' }}>{rev.author?.firstName} {rev.author?.lastName}</div>
                        </div>
                        <div className="review-stars" style={{ fontSize: '0.8rem' }}>{'★'.repeat(rev.rating)}</div>
                      </div>
                      <div className="review-text" style={{ fontSize: '0.85rem' }}>{rev.comment}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr className="section-sep" />

          {/* Map */}
          <div className="fade-in">
            <div className="sec-title">Localisation</div>
            <div className="map-placeholder" style={{ padding: 0, overflow: 'hidden' }}>
              <iframe 
                width="100%" 
                height="250" 
                frameBorder="0" 
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(yacht.location + ' ' + yacht.country)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
            <p style={{ fontSize: '.75rem', color: 'var(--text-light)', marginTop: '.6rem' }}>📍 {yacht.location}, {yacht.country}</p>
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

          {/* Leave a review CTA */}
          <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Avez-vous voyagé sur ce bateau ?</h3>
            <button className="add-review-btn" onClick={() => setIsReviewOpen(true)}>+ Laisser un avis</button>
          </div>
        </div>

        {/* ── BOOKING WIDGET (RIGHT COL) ── */}
        <div className="booking-widget fade-in">
          <div className="widget-header">
            <div className="widget-price-row">
              <div className="widget-price">{formatPrice(yacht.price)} <small>/ jour</small></div>
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
              {yacht.requiresCaptain && (
                <div className="service-item" onClick={() => setWithCaptain(!withCaptain)}>
                  <div className={`service-check ${withCaptain ? 'checked' : ''}`}></div>
                  <div className="service-info">
                    <div className="service-name">Capitaine à bord</div>
                    <div className="service-unit">par jour</div>
                  </div>
                  <div className="service-price">{yacht.captainPrice ? formatPrice(yacht.captainPrice) : 'Gratuit'}</div>
                </div>
              )}
              {yacht.skipperAvailable && (
                <div className="service-item" onClick={() => setWithSkipper(!withSkipper)}>
                  <div className={`service-check ${withSkipper ? 'checked' : ''}`}></div>
                  <div className="service-info">
                    <div className="service-name">Skipper</div>
                    <div className="service-unit">par jour</div>
                  </div>
                  <div className="service-price">{yacht.skipperPrice ? formatPrice(yacht.skipperPrice) : 'Gratuit'}</div>
                </div>
              )}
              <div className="service-item">
                <div className="service-check required"></div>
                <div className="service-info">
                  <div className="service-name required-label">Nettoyage</div>
                  <div className="service-unit">par réservation</div>
                </div>
                <div className="service-price">{formatPrice(yacht.cleaningFee)}</div>
              </div>
              {yacht.securityDeposit > 0 && (
                <div className="service-item" style={{ opacity: 0.9 }}>
                  <div className="service-check required"></div>
                  <div className="service-info">
                    <div className="service-name required-label">Caution (empreinte)</div>
                    <div className="service-unit">non débitée</div>
                  </div>
                  <div className="service-price">{formatPrice(yacht.securityDeposit)}</div>
                </div>
              )}
              {yacht.services?.map((s: any) => (
                <div key={s.id} className="service-item" onClick={() => { if (!s.isRequired) toggleService(s.id); }}>
                  <div className={`service-check ${s.isRequired || selectedServiceIds.includes(s.id) ? 'checked' : ''} ${s.isRequired ? 'required' : ''}`}></div>
                  <div className="service-info">
                    <div className={`service-name ${s.isRequired ? 'required-label' : ''}`}>{s.name}</div>
                    <div className="service-unit">
                      {s.unit === 'PER_BOOKING' ? 'par réservation' : s.unit === 'PER_DAY' ? 'par jour' : 'par personne'}
                    </div>
                  </div>
                  <div className="service-price">{formatPrice(s.price)}</div>
                </div>
              ))}
            </div>

            <div className="discount-row">
              <input className="discount-input" type="text" placeholder="Code de réduction" value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
              <button className="discount-btn" onClick={applyDiscount}>Appliquer</button>
            </div>
            {discountApplied && <div className="discount-success show">✓ Code appliqué — 10% de réduction</div>}

            {totals && (
              <div className="recap" style={{ display: 'block' }}>
                <div className="recap-row"><span className="label">{formatPrice(yacht.price)} × {totals.nights} nuits</span><span className="value">{formatPrice(totals.base)}</span></div>
                <div className="recap-row"><span className="label">Nettoyage (obligatoire)</span><span className="value">{formatPrice(yacht.cleaningFee)}</span></div>
                {yacht.securityDeposit > 0 && <div className="recap-row" style={{ color: 'var(--text-light)' }}><span className="label">Caution (empreinte)</span><span className="value">{formatPrice(yacht.securityDeposit)}</span></div>}
                {totals.servTotal > 0 && <div className="recap-row"><span className="label">Services additionnels</span><span className="value">{formatPrice(totals.servTotal)}</span></div>}
                {totals.discount > 0 && <div className="recap-row discount"><span className="label">Réduction</span><span className="value">−{formatPrice(totals.discount)}</span></div>}
                <div className="recap-row total">
                  <span className="label">Total</span>
                  <span className="value">{formatPrice(totals.total)}</span>
                </div>
              </div>
            )}

            <button className="reserve-btn" onClick={handleBooking} disabled={bookingLoading}>
              {bookingLoading ? 'Vérification...' : 'Réserver ce yacht'}
            </button>
            <Link href={`/dashboard?tab=messages&new_chat_with=${yacht.ownerId}`} passHref>
              <button className="reserve-btn" style={{ marginTop: '10px', backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                Contacter le propriétaire
              </button>
            </Link>
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
              {similarYachts.length > 0 ? similarYachts.map((sim: any) => (
                <div key={sim.id} className="similar-card" onClick={() => window.location.href = `/yacht/${sim.id}`}>
                  <div className="sim-img" style={{ 
                    backgroundImage: sim.images?.[0]?.url ? `url(${sim.images[0].url})` : 'none',
                    background: sim.images?.[0]?.url ? 'none' : `linear-gradient(135deg, var(--navy-mid), var(--navy))`,
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}></div>
                  <div className="sim-body">
                    <div className="sim-type">{sim.boatType}</div>
                    <div className="sim-name">{sim.title}</div>
                    <div className="sim-loc">{sim.location}, {sim.country}</div>
                    <div className="sim-footer">
                      <div className="sim-price">{formatPrice(sim.price)} <small>/ j</small></div>
                      <div className="sim-rating"><span className="star">★</span> {sim.averageRating || 5.0}</div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '2rem', color: 'var(--text-light)' }}>Aucun bateau similaire trouvé.</div>
              )}
            </div>
            <button className="slider-arrow slider-prev">‹</button>
            <button className="slider-arrow slider-next">›</button>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX OVERLAY ── */}
      <div className={`lightbox ${isLightboxOpen ? 'open' : ''}`} onClick={() => setIsLightboxOpen(false)}>
        <button className="lb-close" onClick={() => setIsLightboxOpen(false)}>×</button>
        <div className="lb-bg" onClick={e => e.stopPropagation()} style={{ 
          backgroundImage: yacht.images?.[lightboxIndex]?.url ? `url(${yacht.images[lightboxIndex].url})` : `linear-gradient(135deg, var(--navy-mid), var(--navy))`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
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
            <div style={{ fontSize: '.85rem', color: 'var(--text-mid)' }}>Comment s'est passée votre expérience à bord du {yacht.title} ?</div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <label><input type="radio" name="reviewType" checked={reviewType === 'LISTING'} onChange={() => setReviewType('LISTING')} /> Sur l'annonce</label>
              <label><input type="radio" name="reviewType" checked={reviewType === 'OWNER'} onChange={() => setReviewType('OWNER')} /> Sur le Propriétaire</label>
              <label><input type="radio" name="reviewType" checked={reviewType === 'SITE'} onChange={() => setReviewType('SITE')} /> Sur le Site</label>
            </div>

            <div className="star-selector">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`star-sel ${s <= reviewStars ? 'active' : ''}`} onClick={() => setReviewStars(s)}>★</span>
              ))}
            </div>
            <textarea className="review-textarea" placeholder="Partagez votre expérience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)}></textarea>
          </div>
          <div className="modal-ft">
            <button className="modal-btn secondary" onClick={() => setIsReviewOpen(false)}>Annuler</button>
            <button className="modal-btn primary" onClick={submitReview}>Publier l'avis</button>
          </div>
        </div>
      </div>

      {/* ── LISTING REVIEWS MODAL ── */}
      {isListingReviewsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsListingReviewsModalOpen(false)}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Avis sur {yacht.title}</h3>
              <button onClick={() => setIsListingReviewsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            
            <div className="reviews-overview" style={{ marginBottom: '2rem' }}>
              <div className="reviews-score" style={{ justifyContent: 'center' }}>
                <div className="score-big">{yacht.averageRating || 0}</div>
                <span className="score-stars" style={{ color: 'var(--gold)', fontSize: '2rem', lineHeight: 1 }}>★</span>
                <div className="score-count">{yacht.reviewCount} évaluations</div>
              </div>
            </div>

            {yacht.reviews?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {yacht.reviews.map((rev: any) => (
                  <div key={rev.id} style={{ padding: '1.5rem', background: '#fcfcfc', border: '1px solid var(--sand)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--navy-mid)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                        {rev.author?.avatar ? <img src={rev.author.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%' }} alt="" /> : rev.author?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{rev.author?.firstName} {rev.author?.lastName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(rev.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', color: 'var(--gold)' }}>
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-mid)' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', textAlign: 'center' }}>Aucun avis pour le moment.</p>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span>{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
