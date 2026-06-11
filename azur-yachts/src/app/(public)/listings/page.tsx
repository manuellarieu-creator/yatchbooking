'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import './listings.css';

const YACHTS = [
  { id: 1, name: "Azura Prestige 68", type: "Motor Yacht", tier: "Platinium", country: "France", location: "📍 Nice, Côte d'Azur — France", cap: 8, cab: 4, len: "68ft", time: "24h", captain: "oui", skipper: "oui", price: 4800, rating: 4.9, revs: 24, badge: "Nouveau", badgeColor: "var(--gold)", isVerified: true, img: "linear-gradient(135deg,#1a3a5a 0%,#0a2040 100%)", isFav: false },
  { id: 2, name: "Liberté Bleue 52", type: "Catamaran", tier: "Premium", country: "Grèce", location: "📍 Santorin, Cyclades — Grèce", cap: 10, cab: 5, len: "52ft", time: "24h", captain: "non", skipper: "oui", price: 2900, rating: 4.7, revs: 38, badge: "Premium", badgeColor: "var(--navy)", isVerified: true, img: "linear-gradient(135deg,#1a4a6e 0%,#0a2a40 100%)", isFav: true },
  { id: 3, name: "Belle Époque 44", type: "Voilier", tier: "Standard", country: "Italie", location: "📍 Porto Cervo, Sardaigne — Italie", cap: 6, cab: 3, len: "44ft", time: "12h", captain: "non", skipper: "non", price: 1650, rating: 4.5, revs: 17, badge: "", badgeColor: "", isVerified: false, img: "linear-gradient(135deg,#3a2a1a 0%,#1a1008 100%)", isFav: false },
  { id: 4, name: "Ibiza Crown 86", type: "Superyacht", tier: "Platinium", country: "Espagne", location: "📍 Ibiza, Baléares — Espagne", cap: 12, cab: 6, len: "86ft", time: "24h", captain: "oui", skipper: "oui", price: 7200, rating: 5.0, revs: 9, badge: "Coup de cœur", badgeColor: "var(--gold)", isVerified: true, img: "linear-gradient(135deg,#0a2a1a 0%,#051510 100%)", isFav: false },
  { id: 5, name: "Adriatic Storm 55", type: "Motor Yacht", tier: "Standard", country: "Croatie", location: "📍 Dubrovnik, Dalmatie — Croatie", cap: 8, cab: 4, len: "55ft", time: "24h", captain: "non", skipper: "oui", price: 3400, rating: 4.6, revs: 22, badge: "Standard", badgeColor: "var(--navy)", isVerified: false, img: "linear-gradient(135deg,#1a2a4a 0%,#0a1530 100%)", isFav: false },
  { id: 6, name: "Caribbean Dream 60", type: "Catamaran", tier: "Premium", country: "Caraïbes", location: "📍 Martinique — Caraïbes", cap: 10, cab: 5, len: "60ft", time: "24h", captain: "non", skipper: "oui", price: 5500, rating: 4.8, revs: 31, badge: "Populaire", badgeColor: "var(--gold)", isVerified: true, img: "linear-gradient(135deg,#1a3a2a 0%,#0a2015 100%)", isFav: false },
  { id: 7, name: "Mistral Élégance 48", type: "Voilier", tier: "Standard", country: "France", location: "📍 Marseille, PACA — France", cap: 6, cab: 3, len: "48ft", time: "8h", captain: "non", skipper: "non", price: 2100, rating: 4.3, revs: 11, badge: "", badgeColor: "", isVerified: false, img: "linear-gradient(135deg,#2a1a3a 0%,#150a20 100%)", isFav: false },
  { id: 8, name: "Aegean Spirit 72", type: "Motor Yacht", tier: "Platinium", country: "Grèce", location: "📍 Mykonos, Cyclades — Grèce", cap: 10, cab: 5, len: "72ft", time: "24h", captain: "oui", skipper: "oui", price: 6100, rating: 4.9, revs: 19, badge: "En vedette", badgeColor: "var(--gold)", isVerified: true, img: "linear-gradient(135deg,#1a2a3a 0%,#0a1520 100%)", isFav: false },
  { id: 9, name: "Costa Brava 38", type: "Voilier", tier: "Standard", country: "Espagne", location: "📍 Barcelone — Espagne", cap: 4, cab: 2, len: "38ft", time: "8h", captain: "non", skipper: "non", price: 1200, rating: 4.2, revs: 8, badge: "", badgeColor: "", isVerified: false, img: "linear-gradient(135deg,#2a2a1a 0%,#151508 100%)", isFav: false }
];

export default function ListingsPage() {
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  const [yachts, setYachts] = useState(YACHTS);

  // ── Filters State ──
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState(500);
  const [priceMax, setPriceMax] = useState(15000);
  const [countries, setCountries] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [minCap, setMinCap] = useState(0);
  const [captainReq, setCaptainReq] = useState('indiff'); // 'oui', 'non', 'indiff'
  const [skipperAvail, setSkipperAvail] = useState('indiff'); // 'oui', 'non', 'indiff'
  const [minRating, setMinRating] = useState(0);

  const [sortOrder, setSortOrder] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Handlers
  const toggleFav = (id: number) => {
    setYachts(yachts.map(y => y.id === id ? { ...y, isFav: !y.isFav } : y));
    const isFavNow = !yachts.find(y => y.id === id)?.isFav;
    triggerToast(isFavNow ? 'Ajouté aux favoris' : 'Retiré des favoris');
  };

  const toggleArrayFilter = (arr: string[], val: string, setter: (a: string[]) => void) => {
    if (arr.includes(val)) setter(arr.filter(v => v !== val));
    else setter([...arr, val]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceMin(500);
    setPriceMax(15000);
    setCountries([]);
    setTypes([]);
    setMinCap(0);
    setCaptainReq('indiff');
    setSkipperAvail('indiff');
    setMinRating(0);
  };

  const removeFilterTag = (type: string, val?: string) => {
    if (type === 'country' && val) setCountries(countries.filter(c => c !== val));
    if (type === 'type' && val) setTypes(types.filter(t => t !== val));
    if (type === 'cap') setMinCap(0);
    if (type === 'captain') setCaptainReq('indiff');
    if (type === 'skipper') setSkipperAvail('indiff');
    if (type === 'rating') setMinRating(0);
  };

  // Filter Logic
  const filteredYachts = useMemo(() => {
    return yachts.filter(y => {
      if (searchQuery && !y.location.toLowerCase().includes(searchQuery.toLowerCase()) && !y.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (y.price < priceMin || y.price > priceMax) return false;
      if (countries.length > 0 && !countries.includes(y.country)) return false;
      if (types.length > 0 && !types.includes(y.type)) return false;
      if (y.cap < minCap) return false;
      if (captainReq !== 'indiff' && y.captain !== captainReq) return false;
      if (skipperAvail !== 'indiff' && y.skipper !== skipperAvail) return false;
      if (y.rating < minRating) return false;
      return true;
    }).sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      if (sortOrder === 'rating') return b.rating - a.rating;
      if (sortOrder === 'popular') return b.revs - a.revs;
      return 0; // recent (default)
    });
  }, [yachts, searchQuery, priceMin, priceMax, countries, types, minCap, captainReq, skipperAvail, minRating, sortOrder]);

  const activeFilterTags = [
    ...countries.map(c => ({ label: c, type: 'country', val: c })),
    ...types.map(t => ({ label: t, type: 'type', val: t })),
    ...(minCap > 0 ? [{ label: `≥ ${minCap} pers.`, type: 'cap' }] : []),
    ...(captainReq !== 'indiff' ? [{ label: `Capitaine : ${captainReq}`, type: 'captain' }] : []),
    ...(skipperAvail !== 'indiff' ? [{ label: `Skipper : ${skipperAvail}`, type: 'skipper' }] : []),
    ...(minRating > 0 ? [{ label: `≥ ${minRating}★`, type: 'rating' }] : []),
  ];

  return (
    <div className="listings-container">
      {/* ── NAV ── */}
      <nav className="nav-top">
        <Link href="/" className="nav-logo">AZUR<span>&nbsp;YACHTS</span></Link>
        <ul className="nav-links">
          <li><Link href="/">Accueil</Link></li>
          <li><Link href="/listings" className="active">Les Offres</Link></li>
          <li><Link href="#">Destinations</Link></li>
          <li><Link href="/about">À propos</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <div className="nav-right">
          <Link href="/auth"><button className="nav-btn nav-btn-outline">Connexion</button></Link>
          <Link href="/publish"><button className="nav-btn nav-btn-gold">Mettre en location</button></Link>
        </div>
      </nav>

      {/* ── HERO STRIP ── */}
      <div className="page-hero">
        <svg className="hero-yacht-silhouette" width="500" height="180" viewBox="0 0 600 200" fill="none">
          <path d="M50 160 L550 160 L480 110 L300 80 L120 110 Z" fill="#b8985a"/>
          <path d="M300 80 L300 20 L200 80 Z" fill="#b8985a"/>
          <path d="M300 80 L300 10 L410 80 Z" fill="#b8985a" opacity="0.5"/>
          <line x1="50" y1="160" x2="550" y2="160" stroke="#b8985a" strokeWidth="2"/>
          <path d="M50 165 Q180 175 300 165 Q420 155 550 165" stroke="#b8985a" strokeWidth="1.5" fill="none" opacity="0.4"/>
        </svg>
        <div className="page-hero-inner">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link><span className="sep">/</span>
            <span className="current">Les Offres</span>
          </div>
          <span className="page-eyebrow">Notre flotte complète</span>
          <h1 className="page-title">Découvrez nos yachts<br/>d'<em>exception</em></h1>
          <p className="page-intro">
            Chaque embarcation de notre flotte est <strong>minutieusement sélectionnée</strong> et validée par notre équipe d'experts nautiques. Tous nos annonceurs sont <strong>vérifiés individuellement</strong> — leur identité, leurs documents et leurs bateaux — pour vous garantir une expérience en mer <strong>en toute sérénité</strong>. Avec plus de 340 yachts disponibles dans 68 destinations, l'aventure qui vous ressemble est à portée de clic.
          </p>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="search-bar-wrap">
        <div className="search-field">
          <span className="search-field-icon">📍</span>
          <div className="search-field-inner">
            <div className="search-field-label">Destination</div>
            <input className="search-field-input" type="text" placeholder="Pays, port, région…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="search-divider"></div>
        <div className="search-field">
          <span className="search-field-icon">📅</span>
          <div className="search-field-inner">
            <div className="search-field-label">Départ</div>
            <input className="search-field-input" type="date" />
          </div>
        </div>
        <div className="search-divider"></div>
        <div className="search-field">
          <span className="search-field-icon">📅</span>
          <div className="search-field-inner">
            <div className="search-field-label">Retour</div>
            <input className="search-field-input" type="date" />
          </div>
        </div>
        <div className="search-divider"></div>
        <span className="result-count"><strong>{filteredYachts.length}</strong> yachts trouvés</span>
        <button className="search-submit">Rechercher</button>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="page-body">

        {/* ── SIDEBAR FILTERS ── */}
        <aside className={`filters-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
          <div className="filters-header">
            <span className="filters-title">Filtres</span>
            <button className="filters-reset" onClick={clearFilters}>Tout effacer</button>
          </div>

          <div className="active-filters">
            {activeFilterTags.map((tag, i) => (
              <span key={i} className="active-filter">
                {tag.label} <span className="active-filter-x" onClick={() => removeFilterTag(tag.type, tag.val)}>×</span>
              </span>
            ))}
          </div>

          {/* Prix */}
          <div className="filter-group">
            <div className="filter-group-title">Prix par jour</div>
            <div className="range-wrap">
              <div className="range-values">
                <span className="range-val">€{priceMin} <small>min</small></span>
                <span className="range-val">€{priceMax} <small>max</small></span>
              </div>
              <div className="dual-range">
                <div className="range-track"></div>
                <div className="range-fill" style={{ left: `${(priceMin/15000)*100}%`, right: `${100 - (priceMax/15000)*100}%` }}></div>
                <input type="range" min="500" max="15000" value={priceMin} step="100" onChange={e => { const val = parseInt(e.target.value); if(val < priceMax) setPriceMin(val); }} />
                <input type="range" min="500" max="15000" value={priceMax} step="100" onChange={e => { const val = parseInt(e.target.value); if(val > priceMin) setPriceMax(val); }} />
              </div>
            </div>
          </div>

          {/* Pays */}
          <div className="filter-group">
            <div className="filter-group-title">Pays du port d'attache</div>
            <div className="check-list">
              {['France', 'Grèce', 'Italie', 'Espagne', 'Croatie', 'Caraïbes'].map(c => (
                <label key={c} className="check-item">
                  <input type="checkbox" checked={countries.includes(c)} onChange={() => toggleArrayFilter(countries, c, setCountries)} />
                  <span className="check-box"></span><span className="check-label">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="filter-group">
            <div className="filter-group-title">Type de bateau</div>
            <div className="check-list">
              {['Voilier', 'Catamaran', 'Motor Yacht', 'Superyacht'].map(t => (
                <label key={t} className="check-item">
                  <input type="checkbox" checked={types.includes(t)} onChange={() => toggleArrayFilter(types, t, setTypes)} />
                  <span className="check-box"></span><span className="check-label">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Capacité */}
          <div className="filter-group">
            <div className="filter-group-title">Capacité adultes (min.)</div>
            <div className="check-list">
              {[2, 4, 6, 10].map(c => (
                <label key={c} className="check-item">
                  <input type="radio" name="cap" checked={minCap === c} onChange={() => setMinCap(c)} />
                  <span className="check-box" style={{ borderRadius: '50%' }}></span><span className="check-label">{c}+ personnes</span>
                </label>
              ))}
            </div>
          </div>

          {/* Capitaine */}
          <div className="filter-group">
            <div className="filter-group-title">Capitaine requis</div>
            <div className="toggle-pair">
              {['oui', 'non', 'indiff'].map(opt => (
                <button key={opt} className={`toggle-option ${captainReq === opt ? 'active' : ''}`} onClick={() => setCaptainReq(opt)}>
                  {opt === 'indiff' ? 'Indiff.' : opt === 'oui' ? 'Oui' : 'Non'}
                </button>
              ))}
            </div>
          </div>

          {/* Skipper */}
          <div className="filter-group">
            <div className="filter-group-title">Skipper disponible</div>
            <div className="toggle-pair">
              {['oui', 'non', 'indiff'].map(opt => (
                <button key={opt} className={`toggle-option ${skipperAvail === opt ? 'active' : ''}`} onClick={() => setSkipperAvail(opt)}>
                  {opt === 'indiff' ? 'Indiff.' : opt === 'oui' ? 'Oui' : 'Non'}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="filter-group" style={{ borderBottom: 'none' }}>
            <div className="filter-group-title">Note minimale</div>
            <div className="stars-filter">
              <label className="star-row">
                <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} />
                <span className="star-radio"></span><span className="star-label">Toutes les notes</span>
              </label>
              <label className="star-row">
                <input type="radio" name="rating" checked={minRating === 3} onChange={() => setMinRating(3)} />
                <span className="star-radio"></span><span className="star-label"><span className="stars">★★★</span> 3+ étoiles</span>
              </label>
              <label className="star-row">
                <input type="radio" name="rating" checked={minRating === 4} onChange={() => setMinRating(4)} />
                <span className="star-radio"></span><span className="star-label"><span className="stars">★★★★</span> 4+ étoiles</span>
              </label>
              <label className="star-row">
                <input type="radio" name="rating" checked={minRating === 4.5} onChange={() => setMinRating(4.5)} />
                <span className="star-radio"></span><span className="star-label"><span className="stars">★★★★½</span> 4,5+</span>
              </label>
            </div>
          </div>
        </aside>

        {/* ── LISTING MAIN ── */}
        <main className="listing-main">
          <div className="listing-toolbar">
            <div className="toolbar-left">
              <span className="count-label"><em>{filteredYachts.length}</em> yachts</span>
              <span className="count-sub">dans toutes les destinations</span>
            </div>
            <div className="toolbar-right">
              <button className="nav-btn nav-btn-outline" style={{ fontSize: '.7rem', display: 'none' }} onClick={() => setMobileFilterOpen(!mobileFilterOpen)}>⚙ Filtres</button>
              <select className="sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="recent">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
                <option value="popular">Popularité</option>
              </select>
              <div className="view-toggle">
                <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
                <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>☰</button>
              </div>
            </div>
          </div>

          {filteredYachts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⚓</div>
              <div className="empty-title">Aucun yacht trouvé</div>
              <div className="empty-sub">Modifiez vos filtres ou élargissez votre recherche pour voir plus de résultats.</div>
              <button className="nav-btn nav-btn-gold" onClick={clearFilters}>Réinitialiser les filtres</button>
            </div>
          ) : (
            <>
              <div className={`listings-grid ${viewMode === 'list' ? 'list-mode' : ''}`}>
                {filteredYachts.map((yacht, i) => (
                  <Link href={`/yacht`} key={yacht.id} className="yacht-card" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="card-img">
                      <div className="card-img-inner" style={{ background: yacht.img }}></div>
                      {yacht.badge && <span className="card-badge" style={{ background: yacht.badgeColor }}>{yacht.badge}</span>}
                      {yacht.isVerified && <span className="card-badge verified" style={{ top: 'auto', bottom: '.9rem', left: '.9rem', right: 'auto', fontSize: '.6rem' }}>✓ Vérifié</span>}
                      <button className={`card-fav ${yacht.isFav ? 'active' : ''}`} onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFav(yacht.id); }}>
                        {yacht.isFav ? '♥' : '♡'}
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="card-type">{yacht.type} {yacht.tier !== 'Standard' && `· ${yacht.tier}`}</div>
                      <div className="card-name">{yacht.name}</div>
                      <div className="card-location">{yacht.location}</div>
                      <div className="card-specs">
                        <span className="card-spec">⏱ <strong>{yacht.time}</strong> loc. max</span>
                        <span className="card-spec">👥 <strong>{yacht.cap}</strong> adultes</span>
                        <span className="card-spec">🛏 <strong>{yacht.cab}</strong> cabines</span>
                        <span className="card-spec">📏 <strong>{yacht.len}</strong></span>
                      </div>
                      <div className="card-info">
                        <div className="card-info-row">
                          {yacht.captain === 'oui' ? <span className="card-pill pill-captain">⚓ Captain Required</span> : <span className="card-pill pill-nocaptain">No Captain</span>}
                          {yacht.skipper === 'oui' ? <span className="card-pill pill-skipper">✓ Skipper dispo</span> : <span className="card-pill pill-noskipper">No Skipper</span>}
                        </div>
                        <div className="card-info-row">🌍 Port d'attache : <strong>{yacht.country}</strong></div>
                      </div>
                      <div className="card-footer">
                        <div className="card-price">
                          <div className="card-price-value">€{yacht.price.toLocaleString()}</div>
                          <div className="card-price-unit">par jour</div>
                        </div>
                        <div className="card-rating">
                          <span className="card-star">★</span>
                          <span className="card-rating-val">{yacht.rating.toFixed(1)}</span>
                          <span className="card-rating-count">({yacht.revs} avis)</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pagination">
                <span className="pagination-info">Affichage de 1-{filteredYachts.length} sur {filteredYachts.length} résultats</span>
                <div className="pagination-btns">
                  <button className="pag-btn active">1</button>
                  {filteredYachts.length > 9 && <button className="pag-btn">2</button>}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span>{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
