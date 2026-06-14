'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { ChevronLeft, ChevronRight, Menu, Home, Bell, Settings, X } from 'lucide-react';
import InAppNotifications from '@/components/layout/InAppNotifications';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getSocket } from '@/lib/socket';
import './dashboard.css';

type Section = 'overview' | 'listings' | 'bookings' | 'stats' | 'messages' | 'calendar' | 'reviews';

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Section) || 'overview';
  const [activeSection, setActiveSection] = useState<Section>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as Section;
    if (tab) {
      setActiveSection(tab);
    }
  }, [searchParams]);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chat state
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Mobile state
  // Removed isSidebarOpen since it's now handled by GlobalMobileNav

  // Modal state
  const [activeModal, setActiveModal] = useState<'profile' | 'publish' | 'verify' | 'help' | 'modifyBooking' | 'review' | null>(null);
  const [selectedBookingForMod, setSelectedBookingForMod] = useState<any>(null);
  const [modNewStart, setModNewStart] = useState('');
  const [modNewEnd, setModNewEnd] = useState('');
  const [modNote, setModNote] = useState('');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [reviewType, setReviewType] = useState<'SITE' | 'OWNER' | 'LISTING'>('LISTING');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeSection === 'messages') {
      scrollToBottom();
    }
  }, [messages, activeSection]);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(data => {
      if (!data.error) setDashboardData(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    fetchConversations();
    
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        
        // Notify if new messages arrived and it's not the first load
        if (lastMessageCount > 0 && data.messages.length > lastMessageCount) {
          const newMsgs = data.messages.slice(lastMessageCount);
          newMsgs.forEach((msg: any) => {
            // Only notify if we didn't send it
            if (msg.senderId !== dashboardData?.user?.id && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`Nouveau message de ${msg.sender.firstName}`, { body: msg.content });
            }
          });
        }
        setLastMessageCount(data.messages.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time Socket.io events
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !dashboardData?.user?.id) return;

    // Join personal room to receive targeted events
    socket.emit('join', dashboardData.user.id);

    const handleNewMessage = (msg: any) => {
      fetchConversations();
      if (activeConvId === msg.conversationId) {
        fetchMessages(activeConvId);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [activeConvId, dashboardData?.user?.id]);

  useEffect(() => {
    if (activeConvId) {
      setLastMessageCount(0); // reset when switching
      fetchMessages(activeConvId);
    }
  }, [activeConvId]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3000);
  };

  const sendMsg = async () => {
    if (!chatInput.trim() || !activeConvId) return;
    const content = chatInput;
    setChatInput('');
    
    // Optimistic UI update
    const tempId = 'temp-' + Date.now();
    const now = new Date();
    const time = `${now.getHours()}h${String(now.getMinutes()).padStart(2, '0')}`;
    
    setMessages([...messages, { 
      id: tempId, 
      senderId: dashboardData?.user?.id, 
      content, 
      createdAt: now.toISOString() 
    }]);

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvId, content })
      });
      fetchMessages(activeConvId);
      fetchConversations();
    } catch (err) {
      console.error(err);
      triggerToast('Erreur lors de l\'envoi du message');
    }
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

  if (isLoading || !dashboardData) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Chargement du tableau de bord...</div>;
  }

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


      <div className="app-layout">
        <DashboardSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          setActiveModal={setActiveModal} 
        />

        {/* MAIN */}
        <main className="main">
          
          {/* ══════ OVERVIEW ══════ */}
          <div className={`section-panel ${activeSection === 'overview' ? 'active' : ''}`}>
            {dashboardData.user?.role === 'CLIENT' ? (
              <>
                <div className="page-hd">
                  <div className="page-hd-left">
                    <span className="page-eyebrow">Tableau de bord</span>
                    <h1 className="page-title">Bonjour, <em>{dashboardData.user.firstName}</em> 👋</h1>
                    <p className="page-sub">Prêt pour votre prochaine aventure nautique ?</p>
                  </div>
                  <Link href="/listings"><button className="btn btn-gold">⛵ Réserver un yacht</button></Link>
                </div>

                <div className="kpi-grid">
                  <Link href="/reservations" className="kpi-card navy" style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>
                    <div className="kpi-lbl">Mes Réservations</div>
                    <div className="kpi-val">{dashboardData.bookings?.length || 0}</div>
                    <div className="kpi-sub">Total depuis l'inscription</div>
                  </Link>
                  <Link href="/favorites" className="kpi-card gold" style={{ textDecoration: 'none', cursor: 'pointer', color: 'inherit' }}>
                    <div className="kpi-lbl">Mes Favoris</div>
                    <div className="kpi-val">❤️</div>
                    <div className="kpi-sub">Voir vos bateaux sauvegardés</div>
                  </Link>
                  <div className="kpi-card green" onClick={() => setActiveSection('messages')} style={{ cursor: 'pointer' }}>
                    <div className="kpi-lbl">Messages</div>
                    <div className="kpi-val">💬</div>
                    <div className="kpi-sub">Vos conversations</div>
                  </div>
                </div>

                <div className="table-card" style={{ marginTop: '2rem' }}>
                  <div className="table-header">
                    <div className="table-title">Vos dernières réservations</div>
                    <Link href="/reservations"><button className="btn btn-outline btn-sm">Voir tout</button></Link>
                  </div>
                  {dashboardData.bookings?.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      Vous n'avez pas encore de réservation.
                    </div>
                  ) : (
                    <table>
                      <thead><tr><th>Référence</th><th>Bateau</th><th>Dates</th><th>Statut</th></tr></thead>
                      <tbody>
                        {dashboardData.bookings?.slice(0, 5).map((b: any) => (
                          <tr key={b.id}>
                            <td><strong>{b.id.slice(-6).toUpperCase()}</strong></td>
                            <td>{b.listing?.title || 'Bateau non spécifié'}</td>
                            <td>{new Date(b.startDate).toLocaleDateString()}</td>
                            <td><span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <>
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
                    <h1 className="page-title">Bonjour, <em>{dashboardData.user?.firstName || 'Partenaire'}</em> 👋</h1>
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
              <div className="kpi-card navy" onClick={() => setActiveSection('bookings')} style={{ cursor: 'pointer' }}>
                <div className="kpi-lbl">Réservations actives</div>
                <div className="kpi-val">{dashboardData.stats.bookingsCount}</div>
                <div className="kpi-sub">Cliquez pour voir les détails</div>
              </div>
              <div className="kpi-card green">
                <div className="kpi-lbl">Taux d'occupation</div>
                <div className="kpi-val">{dashboardData.stats.occupancyRate}%</div>
                <div className="kpi-delta up">↑ +5pts vs mois dernier</div>
              </div>
              <div className="kpi-card orange">
                <div className="kpi-lbl">Note moyenne</div>
                <div className="kpi-val">{dashboardData.stats.averageRating || 0}★</div>
                <div className="kpi-sub">Basé sur {dashboardData.stats.totalReviews || 0} avis</div>
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
              </>
            )}
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
                        <Link href={`/publish?edit=${l.id}`}><button className="lmc-btn" style={{ background: 'var(--gold)', color: 'white', border: 'none' }}>Modifier</button></Link>
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
              <div className="table-wrapper">
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
                            {(b.status === 'confirmed' || b.status === 'pending') && (
                              <button className="act-btn" style={{ color: 'var(--gold)' }} onClick={() => { setSelectedBookingForMod(b); setActiveModal('modifyBooking'); }}>Modifier</button>
                            )}
                            {b.status === 'pending' && <button className="act-btn danger" onClick={() => triggerToast('Annulation…')}>Annuler</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <div className="kpi-card gold"><div className="kpi-lbl">Revenus totaux</div><div className="kpi-val">€{dashboardData.stats.revenue.toLocaleString()}</div><div className="kpi-delta up">↑ Depuis l'inscription</div></div>
              <div className="kpi-card navy"><div className="kpi-lbl">Total réservations</div><div className="kpi-val">{dashboardData.stats.bookingsCount}</div><div className="kpi-sub">Total historique</div></div>
              <div className="kpi-card green"><div className="kpi-lbl">Vues totales</div><div className="kpi-val">{dashboardData.stats.views.toLocaleString()}</div><div className="kpi-delta up">Sur toutes les annonces</div></div>
              <div className="kpi-card orange"><div className="kpi-lbl">Taux de conversion</div><div className="kpi-val">{dashboardData.stats.views > 0 ? ((dashboardData.stats.bookingsCount / dashboardData.stats.views) * 100).toFixed(1) : 0}%</div><div className="kpi-sub">vues → réservations</div></div>
            </div>
            {dashboardData.stats.revenueByListing && dashboardData.stats.revenueByListing.length > 0 ? (() => {
              const colors = ['var(--navy)', 'var(--gold)', '#e67e22', '#2ecc71', '#9b59b6'];
              const C = 2 * Math.PI * 48;
              let currentOffset = 0;
              const maxRev = dashboardData.stats.revenueByListing[0].revenue;
              const totalRev = dashboardData.stats.revenue || 1;
              return (
                <div className="stats-row">
                  <div className="chart-card" style={{ marginBottom: 0 }}>
                    <div className="chart-header"><div className="chart-title">Revenus par annonce</div></div>
                    <div className="chart-area">
                      {dashboardData.stats.revenueByListing.map((item: any, i: number) => {
                        const height = (item.revenue / maxRev) * 100;
                        return (
                          <div className="chart-bar-wrap" key={i}>
                            <div className="chart-bar-val">€{item.revenue >= 1000 ? (item.revenue / 1000).toFixed(1) + 'K' : item.revenue}</div>
                            <div className="chart-bar" style={{ height: `${height}%`, background: colors[i % colors.length] }}></div>
                            <div className="chart-bar-label">{item.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="donut-card">
                    <svg className="donut-svg" width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="48" fill="none" stroke="var(--sand)" strokeWidth="16"/>
                      {dashboardData.stats.revenueByListing.map((item: any, i: number) => {
                        const pct = item.revenue / totalRev;
                        const dash = pct * C;
                        const offset = -currentOffset;
                        currentOffset += dash;
                        return (
                          <circle key={i} cx="60" cy="60" r="48" fill="none" stroke={colors[i % colors.length]} strokeWidth="16" strokeDasharray={`${dash} ${C}`} strokeDashoffset={offset} transform="rotate(-90 60 60)"/>
                        );
                      })}
                      <text x="60" y="57" textAnchor="middle" fontFamily="Cormorant Garamond" fontSize="18" fill="var(--navy)">
                        €{dashboardData.stats.revenue >= 1000 ? (dashboardData.stats.revenue / 1000).toFixed(1) + 'K' : dashboardData.stats.revenue}
                      </text>
                      <text x="60" y="70" textAnchor="middle" fontFamily="Jost" fontSize="8" fill="var(--text-light)">total</text>
                    </svg>
                    <div className="donut-legend">
                      {dashboardData.stats.revenueByListing.map((item: any, i: number) => {
                        const pct = Math.round((item.revenue / totalRev) * 100);
                        return (
                          <div className="donut-leg-item" key={i}>
                            <div className="donut-leg-dot" style={{ background: colors[i % colors.length] }}></div>
                            {item.title} — {pct}%
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="stats-row" style={{ padding: '2rem', textAlign: 'center', background: '#fff', border: '1px solid var(--sand)', borderRadius: '4px', color: 'var(--text-mid)' }}>
                Aucune donnée de revenu pour le moment.
              </div>
            )}
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
              <div className={`conv-list ${activeConvId ? 'mobile-hidden' : ''}`}>
                <div className="conv-list-header">Conversations ({conversations.length})</div>
                
                {conversations.length === 0 && (
                  <div style={{ padding: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    Aucune conversation pour le moment.
                  </div>
                )}
                
                {conversations.map(conv => (
                  <div key={conv.id} className={`conv-item ${activeConvId === conv.id ? 'active' : ''}`} onClick={() => setActiveConvId(conv.id)}>
                    <div className="conv-item-top">
                      <div className="conv-av">{conv.otherUser.firstName?.[0] || 'U'}{conv.otherUser.lastName?.[0] || ''}</div>
                      <div className="conv-name">{conv.otherUser.firstName} {conv.otherUser.lastName}</div>
                      <div className="conv-time">
                        {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </div>
                      {conv.unreadCount > 0 && <div className="conv-unread">{conv.unreadCount}</div>}
                    </div>
                    <div className="conv-preview">
                      {conv.lastMessage ? conv.lastMessage.content : 'Nouvelle conversation'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={`chat-area ${!activeConvId ? 'mobile-hidden' : ''}`}>
                {!activeConvId ? (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                    Sélectionnez une conversation pour commencer
                  </div>
                ) : (
                  <>
                    <div className="chat-header">
                      {(() => {
                        const activeConvObj = conversations.find(c => c.id === activeConvId);
                        const otherUser = activeConvObj?.otherUser || { firstName: 'Utilisateur', lastName: '' };
                        return (
                          <>
                            <button className="chat-back-btn desktop-hidden" onClick={() => setActiveConvId(null)}>‹</button>
                            <div className="chat-header-av">{otherUser.firstName?.[0] || 'U'}{otherUser.lastName?.[0] || ''}</div>
                            <div className="chat-header-info">
                              <div className="chat-header-name">{otherUser.firstName} {otherUser.lastName}</div>
                              <div className="chat-header-sub">{activeConvObj?.listingTitle || 'Annonce supprimée'}</div>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={() => triggerToast('Profil utilisateur…')}>Voir le profil</button>
                          </>
                        );
                      })()}
                    </div>
                    <div className="chat-messages">
                      {messages.map(msg => {
                        const isOutgoing = msg.senderId === dashboardData.user.id;
                        const msgTime = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        return (
                          <div key={msg.id} className={`chat-msg ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                            {msg.content}
                            <span className="chat-msg-time">{msgTime}</span>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-row">
                      <textarea 
                        className="chat-input" 
                        placeholder="Écrire un message…" 
                        value={chatInput} 
                        onChange={e => setChatInput(e.target.value)} 
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMsg();
                          }
                        }}
                        rows={1}
                        style={{ resize: 'none', fontFamily: 'inherit', borderRadius: '20px', minHeight: '42px', padding: '0.75rem 1rem' }}
                      />
                      <button className="chat-send-btn" onClick={sendMsg}>➤</button>
                    </div>
                  </>
                )}
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

          {/* ══════ AVIS ══════ */}
          <div className={`section-panel ${activeSection === 'reviews' ? 'active' : ''}`}>
            <div className="page-hd">
              <div className="page-hd-left">
                <span className="page-eyebrow">Avis</span>
                <h1 className="page-title">Laissez un <em>avis</em></h1>
                <p className="page-sub">Partagez votre expérience avec la communauté.</p>
              </div>
            </div>
            
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Vos réservations (pour laisser un avis)</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Bateau</th><th>Dates</th><th>Actions</th></tr></thead>
                  <tbody>
                    {dashboardData.bookings.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>Aucune réservation pour le moment.</td></tr>
                    ) : (
                      dashboardData.bookings.map((b: any) => (
                        <tr key={b.id}>
                          <td>{b.listing.title}</td>
                          <td>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-gold btn-sm" onClick={() => { setSelectedBookingForReview(b); setActiveModal('review'); }}>Laisser un avis</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* MODAL IFRAME */}
      <div className={`modal-overlay ${activeModal ? 'open' : ''}`} onClick={() => setActiveModal(null)}>
        <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">
              {activeModal === 'profile' ? 'Mon Profil' : 
               activeModal === 'publish' ? 'Nouvelle Annonce' : 
               activeModal === 'verify' ? 'Vérification Vidéo' : 
               activeModal === 'help' ? 'Aide & Support' : ''}
            </h3>
            <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
          </div>
          <div className="modal-body-iframe">
            {activeModal === 'profile' && <iframe src="/profile?modal=true" />}
            {activeModal === 'publish' && <iframe src="/publish?modal=true" />}
            {activeModal === 'verify' && <iframe src="/verify?modal=true" />}
            {activeModal === 'help' && (
              <div style={{ padding: '2rem', textAlign: 'center', fontFamily: "'Jost', sans-serif" }}>
                <h3>Centre d'aide</h3>
                <p>Contactez notre support à <strong>support@azuryachts.com</strong> ou appelez le <strong>+33 1 23 45 67 89</strong>.</p>
              </div>
            )}
            {activeModal === 'modifyBooking' && selectedBookingForMod && (
              <div style={{ padding: '2rem', fontFamily: "'Jost', sans-serif" }}>
                <h3>Modifier la réservation {selectedBookingForMod.id.slice(-6).toUpperCase()}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Un supplément de 40€ sera appliqué si la modification est approuvée.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Nouvelle date de début</label>
                    <input type="date" style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }} value={modNewStart} onChange={e => setModNewStart(e.target.value)} />
                  </div>
                  <div>
                    <label>Nouvelle date de fin</label>
                    <input type="date" style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }} value={modNewEnd} onChange={e => setModNewEnd(e.target.value)} />
                  </div>
                  <div>
                    <label>Motif / Note pour le propriétaire</label>
                    <textarea style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', minHeight: '80px' }} value={modNote} onChange={e => setModNote(e.target.value)} />
                  </div>
                  <button className="btn btn-gold" onClick={async () => {
                    if (!modNewStart || !modNewEnd) return triggerToast('Veuillez sélectionner les dates');
                    try {
                      const res = await fetch(`/api/bookings/${selectedBookingForMod.id}/modify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ newStart: modNewStart, newEnd: modNewEnd, note: modNote })
                      });
                      const data = await res.json();
                      if (data.success) {
                        triggerToast('Demande envoyée !');
                        setActiveModal(null);
                      } else {
                        triggerToast(data.error);
                      }
                    } catch (e) {
                      triggerToast('Erreur réseau');
                    }
                  }}>
                    Soumettre la demande
                  </button>
                </div>
              </div>
            )}
            {activeModal === 'review' && selectedBookingForReview && (
              <div style={{ padding: '2rem', fontFamily: "'Jost', sans-serif" }}>
                <h3>Laisser un avis pour {selectedBookingForReview.listing.title}</h3>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label><input type="radio" name="reviewType" checked={reviewType === 'LISTING'} onChange={() => setReviewType('LISTING')} /> Sur l'annonce (Bateau)</label>
                  <label><input type="radio" name="reviewType" checked={reviewType === 'OWNER'} onChange={() => setReviewType('OWNER')} /> Sur le Propriétaire</label>
                  <label><input type="radio" name="reviewType" checked={reviewType === 'SITE'} onChange={() => setReviewType('SITE')} /> Sur le Site</label>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label>Note (/5)</label>
                  <input type="number" min="1" max="5" style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem' }} value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label>Votre avis</label>
                  <textarea style={{ width: '100%', padding: '0.5rem', marginTop: '0.2rem', minHeight: '100px' }} value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
                </div>
                
                <button className="btn btn-gold" onClick={async () => {
                  if (!reviewComment) return triggerToast('Le commentaire est requis');
                  try {
                    const res = await fetch('/api/reviews', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        listingId: selectedBookingForReview.listing.id,
                        targetUserId: selectedBookingForReview.listing.ownerId,
                        targetType: reviewType,
                        rating: reviewRating,
                        comment: reviewComment
                      })
                    });
                    if (res.ok) {
                      triggerToast('Avis publié !');
                      setActiveModal(null);
                    } else {
                      const data = await res.json();
                      triggerToast(data.error);
                    }
                  } catch (e) {
                    triggerToast('Erreur réseau');
                  }
                }}>Publier mon avis</button>
              </div>
            )}
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{padding: '50px', textAlign: 'center'}}>Chargement du tableau de bord...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
