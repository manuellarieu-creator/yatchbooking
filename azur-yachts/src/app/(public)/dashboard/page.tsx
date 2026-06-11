'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './dashboard.css';

type Section = 'overview' | 'listings' | 'bookings' | 'stats' | 'messages' | 'calendar';

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('');
  const [dashboardData, setDashboardData] = useState<any>({ user: { firstName: '', lastName: '', tier: 'PREMIUM' }, stats: { revenue: 0, views: 0, bookingsCount: 0, occupancyRate: 0 }, listings: [], bookings: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(data => {
      if (!data.error) setDashboardData(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);
  
  // Chat state
  const [activeConv, setActiveConv] = useState('JD');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'incoming', text: 'Bonjour, je suis très intéressé par votre Azura Prestige 68 pour la semaine du 14 juin. Est-ce que le yacht inclut un équipage ?', time: '14h28' },
    { id: 2, type: 'outgoing', text: 'Bonjour Jean ! Oui, le yacht inclut un capitaine et notre chef à bord peut être ajouté en service optionnel.', time: '14h30' },
    { id: 3, type: 'incoming', text: 'Excellent ! Est-ce que le chef à bord peut préparer des repas végétaliens ? Ma femme a des restrictions alimentaires.', time: '14h32' }
  ]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3000);
  };

  const sendMsg = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}h${String(now.getMinutes()).padStart(2, '0')}`;
    setMessages([...messages, { id: Date.now(), type: 'outgoing', text: chatInput, time }]);
    setChatInput('');
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const today = new Date();
    const y = 2025; // using 2025 as mock year based on design
    const m = 5; // June 2025
    
    const daysInMonth = getDaysInMonth(y, m);
    const firstDay = getFirstDayOfMonth(y, m);
    
    const grid = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="mc-day empty"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      let className = 'mc-day';
      if (d === 4) className += ' today';
      if (d >= 14 && d <= 21) className += ' booked'; // Jean Dupont
      if (d >= 25 && d <= 28) className += ' blocked'; // Usage personnel
      
      grid.push(
        <div key={d} className={className} onClick={() => triggerToast(`Jour sélectionné : ${d} Juin`)}>
          {d}
        </div>
      );
    }
    return grid;
  };

  const bookings = dashboardData.bookings.map((b: any) => ({
    id: b.id,
    boat: b.listing.title,
    type: b.listing.boatType,
    client: b.client.firstName + ' ' + b.client.lastName,
    dates: new Date(b.startDate).toLocaleDateString() + ' - ' + new Date(b.endDate).toLocaleDateString(),
    nights: b.totalNights,
    total: '€' + b.totalPrice.toLocaleString(),
    payment: 'Stripe',
    status: b.status === 'CONFIRMED' ? 'confirmed' : (b.status === 'PENDING' ? 'pending' : 'payment'),
    badge: b.status,
    badgeClass: 'badge-' + (b.status === 'CONFIRMED' ? 'confirmed' : 'pending')
  }));

  const filteredBookings = bookingFilter ? bookings.filter((b: any) => b.status === bookingFilter) : bookings;

  return (
    <div className="dashboard-container">
      {/* TOP NAV */}
      <div className="top-nav">
        <Link href="/" className="nav-logo">AZUR<span>&nbsp;YACHTS</span></Link>
        <div className="nav-center">
          <button className={`nav-tab ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>Vue d'ensemble</button>
          <button className={`nav-tab ${activeSection === 'listings' ? 'active' : ''}`} onClick={() => setActiveSection('listings')}>Mes annonces</button>
          <button className={`nav-tab ${activeSection === 'bookings' ? 'active' : ''}`} onClick={() => setActiveSection('bookings')}>Réservations</button>
          <button className={`nav-tab ${activeSection === 'stats' ? 'active' : ''}`} onClick={() => setActiveSection('stats')}>Statistiques</button>
          <button className={`nav-tab ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => setActiveSection('messages')}>
            Messages <span className="notif-badge" style={{ position: 'relative', top: 'auto', right: 'auto', display: 'inline-flex', marginLeft: '.3rem', width: '14px', height: '14px', fontSize: '.52rem' }}>3</span>
          </button>
        </div>
        <div className="nav-right">
          <div className="notif-btn" onClick={() => triggerToast('Vous avez 2 nouvelles notifications.')}>
            🔔
            <div className="notif-badge">2</div>
          </div>
          <div className="user-chip">
            <div className="user-av">
              {dashboardData.user.firstName?.[0] || 'U'}
              {dashboardData.user.lastName?.[0] || ''}
            </div>
            <div>
              <div className="user-name">{dashboardData.user.firstName} {dashboardData.user.lastName}</div>
              <div className="user-tier">⭐ {dashboardData.user.tier}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-section-label">Navigation</div>
          <a className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}><span className="sidebar-icon">📊</span>Vue d'ensemble</a>
          <a className={`sidebar-item ${activeSection === 'listings' ? 'active' : ''}`} onClick={() => setActiveSection('listings')}><span className="sidebar-icon">⚓</span>Mes annonces <span className="sidebar-badge gold">3</span></a>
          <a className={`sidebar-item ${activeSection === 'bookings' ? 'active' : ''}`} onClick={() => setActiveSection('bookings')}><span className="sidebar-icon">📅</span>Réservations <span className="sidebar-badge">2</span></a>
          <a className={`sidebar-item ${activeSection === 'stats' ? 'active' : ''}`} onClick={() => setActiveSection('stats')}><span className="sidebar-icon">📈</span>Statistiques</a>
          <a className={`sidebar-item ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => setActiveSection('messages')}><span className="sidebar-icon">💬</span>Messages <span className="sidebar-badge">3</span></a>
          <a className={`sidebar-item ${activeSection === 'calendar' ? 'active' : ''}`} onClick={() => setActiveSection('calendar')}><span className="sidebar-icon">🗓</span>Calendrier</a>
          
          <div className="sidebar-divider"></div>
          
          <div className="sidebar-section-label">Compte</div>
          <a className="sidebar-item" onClick={() => triggerToast('Redirection vers Mon profil…')}><span className="sidebar-icon">👤</span>Mon profil</a>
          <Link className="sidebar-item" href="/publish"><span className="sidebar-icon">➕</span>Nouvelle annonce</Link>
          <a className="sidebar-item" onClick={() => triggerToast('Redirection vers la vérification…')}><span className="sidebar-icon">🎥</span>Vérification vidéo</a>
          
          <div className="sidebar-bottom">
            <div className="sidebar-bottom-item" onClick={() => triggerToast('Déconnexion…')}>🚪 Se déconnecter</div>
            <div className="sidebar-bottom-item" onClick={() => triggerToast('Aide…')}>❓ Aide & support</div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          
          {/* ══════ OVERVIEW ══════ */}
          {isLoading && <div style={{padding: '50px', textAlign: 'center'}}>Chargement du tableau de bord...</div>}
          <div className={`section-panel ${activeSection === 'overview' ? 'active' : ''}`}>
            <div className="verify-banner" style={{ display: 'none' }}>
              <div className="verify-banner-icon">🎥</div>
              <div className="verify-banner-text">
                <div className="vb-title">Complétez votre vérification d'identité vidéo</div>
                <div className="vb-sub">Nécessaire pour publier des annonces et obtenir le badge ✓ Vérifié</div>
              </div>
              <button className="btn btn-gold btn-sm verify-banner-btn" onClick={() => triggerToast('Redirection vers la vérification vidéo…')}>Vérifier maintenant →</button>
            </div>

            <div className="page-hd">
              <div className="page-hd-left">
                <span className="page-eyebrow">Tableau de bord</span>
                <h1 className="page-title">Bonjour, <em>{dashboardData.user.firstName || 'Partenaire'}</em> 👋</h1>
                <p className="page-sub">Voici un résumé de votre activité · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <Link href="/publish"><button className="btn btn-gold">⚓ Nouvelle annonce</button></Link>
            </div>

            <div className="alerts-section">
              {dashboardData.bookings.filter((b: any) => b.status === 'PENDING' || b.status === 'PROOF_SUBMITTED').slice(0, 2).map((booking: any) => (
                <div key={`alert-b-${booking.id}`} className="alert-item warn">
                  <span className="alert-icon">⏳</span>
                  <div>La réservation <strong>{booking.id.slice(-6).toUpperCase()}</strong> ({booking.listing.title}) est en attente {booking.status === 'PROOF_SUBMITTED' ? 'de validation du virement' : 'de paiement par le client'}.</div>
                  <button className="alert-action" onClick={() => setActiveSection('bookings')}>Voir</button>
                </div>
              ))}
              
              {dashboardData.listings.filter((l: any) => l.status === 'ACTIVE').slice(0, 1).map((listing: any) => (
                <div key={`alert-l-${listing.id}`} className="alert-item success">
                  <span className="alert-icon">✅</span>
                  <div>Votre annonce <strong>{listing.title}</strong> est active et visible par les clients.</div>
                </div>
              ))}
              
              {dashboardData.listings.filter((l: any) => l.status === 'PENDING').slice(0, 2).map((listing: any) => (
                <div key={`alert-p-${listing.id}`} className="alert-item info">
                  <span className="alert-icon">ℹ️</span>
                  <div>Votre annonce <strong>{listing.title}</strong> est en cours de validation par nos équipes.</div>
                </div>
              ))}

              {dashboardData.bookings.length === 0 && dashboardData.listings.length === 0 && (
                <div className="alert-item info">
                  <span className="alert-icon">👋</span>
                  <div>Bienvenue sur votre espace annonceur. Commencez par publier votre première annonce !</div>
                  <button className="alert-action" onClick={() => window.location.href = '/publish'}>Publier</button>
                </div>
              )}
            </div>

            <div className="kpi-grid">
              <div className="kpi-card gold">
                <div className="kpi-lbl">Revenus ce mois</div>
                <div className="kpi-val">€{dashboardData.stats.revenue.toLocaleString()}</div>
                <div className="kpi-delta up">↑ +18% vs mois dernier</div>
              </div>
              <div className="kpi-card navy">
                <div className="kpi-lbl">Réservations actives</div>
                <div className="kpi-val">{dashboardData.stats.bookingsCount}</div>
                <div className="kpi-sub">dont 1 en attente paiement</div>
              </div>
              <div className="kpi-card green">
                <div className="kpi-lbl">Taux d'occupation</div>
                <div className="kpi-val">{dashboardData.stats.occupancyRate}%</div>
                <div className="kpi-delta up">↑ +5pts vs mois dernier</div>
              </div>
              <div className="kpi-card orange">
                <div className="kpi-lbl">Note moyenne</div>
                <div className="kpi-val">4.9★</div>
                <div className="kpi-sub">Basé sur 24 avis</div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Revenus des 6 derniers mois</div>
                <div className="chart-legend">
                  <div className="chart-leg-item"><div className="chart-leg-dot" style={{ background: 'var(--navy)' }}></div>Revenus</div>
                  <div className="chart-leg-item"><div className="chart-leg-dot" style={{ background: 'var(--gold)' }}></div>Réservations</div>
                </div>
              </div>
              <div className="chart-area">
                <div className="chart-bar-wrap"><div className="chart-bar-val">€8K</div><div className="chart-bar" style={{ height: '30%' }}></div><div className="chart-bar-label">Jan</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar-val">€12K</div><div className="chart-bar" style={{ height: '45%' }}></div><div className="chart-bar-label">Fév</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar-val">€18K</div><div className="chart-bar gold" style={{ height: '65%' }}></div><div className="chart-bar-label">Mar</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar-val">€15K</div><div className="chart-bar" style={{ height: '55%' }}></div><div className="chart-bar-label">Avr</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar-val">€28K</div><div className="chart-bar gold" style={{ height: '85%' }}></div><div className="chart-bar-label">Mai</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar-val">€34K</div><div className="chart-bar" style={{ height: '100%' }}></div><div className="chart-bar-label">Juin</div></div>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Réservations récentes</div>
                <button className="btn btn-outline btn-sm" onClick={() => setActiveSection('bookings')}>Voir tout</button>
              </div>
              <table>
                <thead><tr>
                  <th>Référence</th><th>Bateau</th><th>Client</th><th>Dates</th><th>Montant</th><th>Statut</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filteredBookings.slice(0, 3).map((b: any) => (
                    <tr key={b.id}>
                      <td><strong>{b.id}</strong></td>
                      <td>
                        <div className="td-yacht">
                          <div className="td-yacht-img">⚓</div>
                          <div><div className="td-yacht-name">{b.boat}</div><div className="td-yacht-type">{b.type}</div></div>
                        </div>
                      </td>
                      <td>{b.client}</td><td>{b.dates}</td><td><strong>{b.total}</strong></td>
                      <td><span className={`badge ${b.badgeClass}`}>{b.badge}</span></td>
                      <td><div className="row-actions"><button className="act-btn" onClick={() => triggerToast('Détails…')}>Détails</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════ MES ANNONCES ══════ */}
          <div className={`section-panel ${activeSection === 'listings' ? 'active' : ''}`}>
            <div className="page-hd">
              <div className="page-hd-left">
                <span className="page-eyebrow">Mes annonces</span>
                <h1 className="page-title">Gérez votre <em>flotte</em></h1>
              </div>
              <Link href="/publish"><button className="btn btn-gold">+ Nouvelle annonce</button></Link>
            </div>

            <div className="listings-grid">
              {dashboardData.listings.map((l: any) => (
                <div className="listing-mini-card" key={l.id}>
                  <div className="lmc-img" style={{ backgroundImage: `url(${l.images?.[0]?.url || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="lmc-img-grad"></div>
                    <div className="lmc-badge"><span className={`badge badge-${l.status === 'ACTIVE' ? 'active' : 'pending'}`}>{l.status}</span></div>
                  </div>
                  <div className="lmc-body">
                    <div className="lmc-type">{l.boatType}</div>
                    <div className="lmc-name">{l.title}</div>
                    <div className="lmc-stats">
                      <span className="lmc-stat">👁 <strong>{l.viewCount || 0}</strong> vues</span>
                      <span className="lmc-stat">📅 <strong>{l._count?.bookings || 0}</strong> résa</span>
                      <span className="lmc-stat">⭐ <strong>{l._count?.reviews ? '4.9' : '—'}</strong></span>
                    </div>
                    <div className="lmc-footer">
                      <div className="lmc-price">€{l.price} <small>/ jour</small></div>
                      <div className="lmc-actions">
                        <Link href={`/yacht/${l.id}`}><button className="lmc-btn">Voir</button></Link>
                        <button className="lmc-btn" onClick={() => triggerToast('Désactivation…')}>⏸</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════ RÉSERVATIONS ══════ */}
          <div className={`section-panel ${activeSection === 'bookings' ? 'active' : ''}`}>
            <div className="page-hd">
              <div className="page-hd-left">
                <span className="page-eyebrow">Réservations</span>
                <h1 className="page-title">Toutes vos <em>réservations</em></h1>
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <select className="tbl-select" value={bookingFilter} onChange={e => setBookingFilter(e.target.value)}>
                  <option value="">Tous statuts</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="pending">En attente</option>
                  <option value="payment">Paiement reçu</option>
                  <option value="completed">Terminées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Historique complet</div>
                <div className="table-actions">
                  <input className="tbl-search" type="text" placeholder="Rechercher…" />
                  <button className="btn btn-outline btn-sm" onClick={() => triggerToast('Export CSV…')}>📄 Exporter</button>
                </div>
              </div>
              <table>
                <thead><tr>
                  <th>Réf.</th><th>Bateau</th><th>Client</th><th>Dates</th><th>Nuits</th><th>Montant</th><th>Paiement</th><th>Statut</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filteredBookings.map((b: any) => (
                    <tr key={b.id}>
                      <td><strong>{b.id}</strong></td>
                      <td>{b.boat}</td>
                      <td>{b.client}</td><td>{b.dates}</td><td>{b.nights}</td><td><strong>{b.total}</strong></td>
                      <td>{b.payment}</td>
                      <td><span className={`badge ${b.badgeClass}`}>{b.badge}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="act-btn" onClick={() => triggerToast('Détails…')}>Détails</button>
                          {b.status !== 'cancelled' && <button className="act-btn" onClick={() => triggerToast('Facture…')}>Facture</button>}
                          {b.status === 'pending' && <button className="act-btn danger" onClick={() => triggerToast('Annulation…')}>Annuler</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════ STATISTIQUES ══════ */}
          <div className={`section-panel ${activeSection === 'stats' ? 'active' : ''}`}>
            <div className="page-hd">
              <div className="page-hd-left">
                <span className="page-eyebrow">Analytics</span>
                <h1 className="page-title">Vos <em>statistiques</em></h1>
              </div>
              <select className="tbl-select">
                <option>6 derniers mois</option>
                <option>12 derniers mois</option>
                <option>Cette année</option>
              </select>
            </div>
            <div className="kpi-grid">
              <div className="kpi-card gold"><div className="kpi-lbl">Revenus totaux</div><div className="kpi-val">€82 750</div><div className="kpi-delta up">↑ +31% vs année préc.</div></div>
              <div className="kpi-card navy"><div className="kpi-lbl">Total réservations</div><div className="kpi-val">8</div><div className="kpi-sub">sur 6 mois</div></div>
              <div className="kpi-card green"><div className="kpi-lbl">Vues totales</div><div className="kpi-val">1 459</div><div className="kpi-delta up">↑ +22%</div></div>
              <div className="kpi-card orange"><div className="kpi-lbl">Taux de conversion</div><div className="kpi-val">1.8%</div><div className="kpi-sub">vues → réservations</div></div>
            </div>
            <div className="stats-row">
              <div className="chart-card" style={{ marginBottom: 0 }}>
                <div className="chart-header"><div className="chart-title">Revenus par annonce</div></div>
                <div className="chart-area">
                  <div className="chart-bar-wrap"><div className="chart-bar-val">€48K</div><div className="chart-bar" style={{ height: '100%', background: 'var(--navy)' }}></div><div className="chart-bar-label">Azura 68</div></div>
                  <div className="chart-bar-wrap"><div className="chart-bar-val">€26K</div><div className="chart-bar gold" style={{ height: '54%', background: 'var(--gold)' }}></div><div className="chart-bar-label">Liberté 52</div></div>
                  <div className="chart-bar-wrap"><div className="chart-bar-val">€8K</div><div className="chart-bar" style={{ height: '17%', background: '#e67e22' }}></div><div className="chart-bar-label">Belle Époque</div></div>
                </div>
              </div>
              <div className="donut-card">
                <svg className="donut-svg" width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="var(--sand)" strokeWidth="16"/>
                  <circle cx="60" cy="60" r="48" fill="none" stroke="var(--navy)" strokeWidth="16" strokeDasharray="180 121" strokeDashoffset="30" transform="rotate(-90 60 60)"/>
                  <circle cx="60" cy="60" r="48" fill="none" stroke="var(--gold)" strokeWidth="16" strokeDasharray="90 211" strokeDashoffset="-150" transform="rotate(-90 60 60)"/>
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#e67e22" strokeWidth="16" strokeDasharray="30 271" strokeDashoffset="-240" transform="rotate(-90 60 60)"/>
                  <text x="60" y="57" textAnchor="middle" fontFamily="Cormorant Garamond" fontSize="18" fill="var(--navy)">€82K</text>
                  <text x="60" y="70" textAnchor="middle" fontFamily="Jost" fontSize="8" fill="var(--text-light)">total</text>
                </svg>
                <div className="donut-legend">
                  <div className="donut-leg-item"><div className="donut-leg-dot" style={{ background: 'var(--navy)' }}></div>Azura 68 — 59%</div>
                  <div className="donut-leg-item"><div className="donut-leg-dot" style={{ background: 'var(--gold)' }}></div>Liberté 52 — 31%</div>
                  <div className="donut-leg-item"><div className="donut-leg-dot" style={{ background: '#e67e22' }}></div>Belle Époque — 10%</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════ MESSAGES ══════ */}
          <div className={`section-panel ${activeSection === 'messages' ? 'active' : ''}`}>
            <div className="page-hd">
              <div className="page-hd-left">
                <span className="page-eyebrow">Messagerie</span>
                <h1 className="page-title">Vos <em>conversations</em></h1>
              </div>
            </div>
            <div className="messages-layout">
              <div className="conv-list">
                <div className="conv-list-header">Conversations (5)</div>
                <div className={`conv-item ${activeConv === 'JD' ? 'active' : ''}`} onClick={() => setActiveConv('JD')}>
                  <div className="conv-item-top">
                    <div className="conv-av">JD</div>
                    <div className="conv-name">Jean Dupont</div>
                    <div className="conv-time">14h32</div>
                  </div>
                  <div className="conv-preview">Est-ce que le chef à bord peut préparer des repas végétaliens ?</div>
                </div>
                <div className={`conv-item ${activeConv === 'SL' ? 'active' : ''}`} onClick={() => setActiveConv('SL')}>
                  <div className="conv-item-top">
                    <div className="conv-av">SL</div>
                    <div className="conv-name">Sophie Lemaire</div>
                    <div className="conv-time">11h15</div>
                    <div className="conv-unread">2</div>
                  </div>
                  <div className="conv-preview">Bonjour, est-il possible de partir de Cannes plutôt que Nice ?</div>
                </div>
                <div className={`conv-item ${activeConv === 'MR' ? 'active' : ''}`} onClick={() => setActiveConv('MR')}>
                  <div className="conv-item-top">
                    <div className="conv-av">MR</div>
                    <div className="conv-name">Marco Ricci</div>
                    <div className="conv-time">Hier</div>
                    <div className="conv-unread">1</div>
                  </div>
                  <div className="conv-preview">Parfait merci ! On se voit le 10 septembre alors.</div>
                </div>
              </div>
              <div className="chat-area">
                <div className="chat-header">
                  <div className="chat-header-av">{activeConv}</div>
                  <div className="chat-header-info">
                    <div className="chat-header-name">{activeConv === 'JD' ? 'Jean Dupont' : activeConv === 'SL' ? 'Sophie Lemaire' : 'Marco Ricci'}</div>
                    <div className="chat-header-sub">{activeConv === 'JD' ? 'Azura Prestige 68' : 'Liberté Bleue 52'} · En ligne</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => triggerToast('Profil client…')}>Voir le profil</button>
                </div>
                <div className="chat-messages">
                  {messages.map(msg => (
                    <div key={msg.id} className={`chat-msg ${msg.type}`}>
                      {msg.text}
                      <span className="chat-msg-time">{msg.time}</span>
                    </div>
                  ))}
                </div>
                <div className="chat-input-row">
                  <input className="chat-input" type="text" placeholder="Écrire un message…" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
                  <button className="chat-send-btn" onClick={sendMsg}>➤</button>
                </div>
              </div>
            </div>
          </div>

          {/* ══════ CALENDRIER ══════ */}
          <div className={`section-panel ${activeSection === 'calendar' ? 'active' : ''}`}>
            <div className="page-hd">
              <div className="page-hd-left">
                <span className="page-eyebrow">Planning</span>
                <h1 className="page-title">Votre <em>calendrier</em></h1>
              </div>
            </div>
            <div className="calendar-grid-wrap">
              <div className="chart-card">
                <div className="mc-header">
                  <button className="mc-nav">‹</button>
                  <span className="mc-title">Juin 2025</span>
                  <button className="mc-nav">›</button>
                </div>
                <div className="mc-grid">
                  <div className="mc-dow">Dim</div><div className="mc-dow">Lun</div><div className="mc-dow">Mar</div>
                  <div className="mc-dow">Mer</div><div className="mc-dow">Jeu</div><div className="mc-dow">Ven</div><div className="mc-dow">Sam</div>
                  {renderCalendar()}
                </div>
                <div className="cal-legend" style={{ marginTop: '.75rem' }}>
                  <div className="cal-leg"><div className="cal-leg-dot booked" style={{ background: 'rgba(184,152,90,.2)', border: '1px solid rgba(184,152,90,.4)' }}></div>Réservé</div>
                  <div className="cal-leg"><div className="cal-leg-dot block" style={{ background: 'rgba(138,26,26,.08)', border: '1px solid var(--danger-bdr)' }}></div>Bloqué</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '.63rem', textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--text-light)', marginBottom: '.75rem' }}>Événements à venir</div>
                <div className="upcoming-list">
                  <div className="upcoming-item"><div className="upcoming-date">14 → 21 Juin 2025</div><div className="upcoming-name">Jean Dupont · Azura Prestige 68</div><div className="upcoming-detail">7 nuits · €34 200</div></div>
                  <div className="upcoming-item"><div className="upcoming-date">3 → 10 Août 2025</div><div className="upcoming-name">Sophie Lemaire · Liberté Bleue 52</div><div className="upcoming-detail">7 nuits · €20 300</div></div>
                  <div className="upcoming-item"><div className="upcoming-date">10 → 17 Sept. 2025</div><div className="upcoming-name">Marco Ricci · Belle Époque 44</div><div className="upcoming-detail">7 nuits · En attente</div></div>
                  <div className="upcoming-item blocked"><div className="upcoming-date">25 → 28 Juin 2025</div><div className="upcoming-name">🔒 Bloqué — Usage personnel</div><div className="upcoming-detail">Azura Prestige 68</div></div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span id="toast-msg">{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
