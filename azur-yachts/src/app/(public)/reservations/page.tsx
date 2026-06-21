'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import '../dashboard/dashboard.css';
import './reservations.css';

function ReservationsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [reservationsData, setReservationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState('');
  const [selectedResaId, setSelectedResaId] = useState('');
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  const [toastMsg, setToastMsg] = useState('');
  const [toastIcon, setToastIcon] = useState('✅');
  const [showToast, setShowToast] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [activeChatResa, setActiveChatResa] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (data.userId) setCurrentUserId(data.userId);
        if (data.bookings) {
          const formatted = data.bookings.map((b: any) => {
            const startDate = new Date(b.startDate);
            const endDate = new Date(b.endDate);
            
            let uiStatus = 'pending';
            if (['PAYMENT_PENDING', 'PAYMENT_RECEIVED'].includes(b.status)) uiStatus = 'payment';
            else if (b.status === 'CONFIRMED') uiStatus = 'confirmed';
            else if (b.status === 'COMPLETED') uiStatus = 'completed';
            else if (['CANCELLED', 'REJECTED'].includes(b.status)) uiStatus = 'cancelled';

            let guestsStr = `${b.adults} adulte${b.adults > 1 ? 's' : ''}`;
            if (b.children > 0) guestsStr += `, ${b.children} enfant${b.children > 1 ? 's' : ''}`;

            return {
              id: b.id.substring(0, 10).toUpperCase(),
              originalId: b.id,
              status: uiStatus,
              type: b.listing?.boatType || 'Yacht',
              name: b.listing?.title || 'Bateau',
              location: `📍 ${b.listing?.location || 'Non spécifié'}`,
              img: b.listing?.images?.[0]?.url ? `url(${b.listing.images[0].url})` : 'linear-gradient(135deg,#1a3a5a,#0a2040)',
              arrival: startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
              departure: endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
              guests: guestsStr,
              nights: b.totalNights,
              price: b.totalPrice,
              priceNote: b.payment?.method === 'BANK_TRANSFER' ? 'Virement bancaire' : b.payment?.method || 'En attente',
              dateValue: startDate.getTime(),
              listingId: b.listing?.id,
              ownerId: b.listing?.ownerId,
            };
          });
          setReservationsData(formatted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const triggerToast = (msg: string, icon = '✅') => {
    setToastMsg(msg);
    setToastIcon(icon);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  const startChat = async (resa: any) => {
    if (!resa.listingId || !resa.ownerId) {
      triggerToast('Informations incomplètes pour contacter le propriétaire', '⚠️');
      return;
    }
    setToastMsg('Ouverture de la messagerie...');
    setToastIcon('💬');
    setShowToast(true);
    
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: resa.listingId, ownerId: resa.ownerId })
      });
      const data = await res.json();
      setShowToast(false);
      
      if (data.conversation) {
        setActiveConvId(data.conversation.id);
        setActiveChatResa(resa);
        setChatModalOpen(true);
        fetchMessages(data.conversation.id);
      } else {
        triggerToast(data.error || 'Erreur lors de la création de la conversation', '❌');
      }
    } catch (err) {
      setShowToast(false);
      triggerToast('Erreur réseau', '❌');
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMsg = async () => {
    if (!chatInput.trim() || !activeConvId) return;
    const content = chatInput;
    setChatInput('');
    
    const tempId = 'temp-' + Date.now();
    const now = new Date();
    setMessages(prev => [...prev, { 
      id: tempId, 
      senderId: currentUserId, 
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
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors de l'envoi du message");
    }
  };

  useEffect(() => {
    if (chatModalOpen && activeConvId) {
      const interval = setInterval(() => {
        fetchMessages(activeConvId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [chatModalOpen, activeConvId]);

  const handleDownloadBookingFile = (resa: any, title: string) => {
    if (!resa) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      triggerToast('Veuillez autoriser les pop-ups pour télécharger le document.', '⚠️');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - ${resa.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2a200; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 600; color: #0a2040; letter-spacing: 2px; }
            .logo span { color: #e2a200; }
            .section { margin-bottom: 30px; }
            .section h3 { font-size: 20px; color: #0a2040; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
            table { width: 100%; font-size: 15px; border-collapse: collapse; }
            td { padding: 8px 0; }
            .label { color: #64748b; width: 150px; }
            .val { font-weight: 500; }
            .box { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 40px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .box { background-color: #f8fafc !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">VOY<span>YACHT</span></div>
              <div style="font-size: 14px; color: #64748b; margin-top: 5px;">Location de yachts de prestige</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: 600; color: #0a2040;">${title.toUpperCase()}</div>
              <div style="font-size: 14px; color: #64748b; margin-top: 5px;">Réf: ${resa.id}</div>
              <div style="font-size: 14px; color: #64748b;">Date: ${new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>

          <div class="section">
            <h3>Détails du Yacht</h3>
            <table>
              <tr><td class="label">Nom</td><td class="val">${resa.name}</td></tr>
              <tr><td class="label">Type</td><td class="val">${resa.type}</td></tr>
              <tr><td class="label">Port d'attache</td><td class="val">${resa.location.replace('📍 ', '')}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Détails du Séjour</h3>
            <table>
              <tr><td class="label">Arrivée prévue</td><td class="val">${resa.arrival}</td></tr>
              <tr><td class="label">Départ prévu</td><td class="val">${resa.departure}</td></tr>
              <tr><td class="label">Durée</td><td class="val">${resa.nights} nuits</td></tr>
              <tr><td class="label">Passagers</td><td class="val">${resa.guests}</td></tr>
            </table>
          </div>

          <div class="box">
            <h3 style="margin-top: 0;">Facturation & Paiement</h3>
            <table>
              <tr><td class="label">Méthode de paiement</td><td class="val" style="text-align: right;">${resa.priceNote}</td></tr>
              <tr><td class="label">Statut de réservation</td><td class="val" style="text-align: right; text-transform: capitalize;">${resa.status}</td></tr>
              <tr>
                <td style="padding: 15px 0 5px; font-size: 18px; font-weight: 600; color: #0a2040; border-top: 1px solid #e2e8f0; margin-top: 10px;">Montant Total (TTC)</td>
                <td style="padding: 15px 0 5px; font-size: 20px; font-weight: 600; color: #e2a200; text-align: right; border-top: 1px solid #e2e8f0;">€${resa.price.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            Ce document est un récapitulatif officiel généré par VoyYacht.<br/>
            Pour toute question, contactez notre support à support@voyyacht.com.
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredReservations = useMemo(() => {
    return reservationsData.filter(r => {
      if (activeTab !== 'all' && r.status !== activeTab) return false;
      if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sortOrder === 'date-desc') return b.dateValue - a.dateValue;
      if (sortOrder === 'date-asc') return a.dateValue - b.dateValue;
      if (sortOrder === 'price-desc') return b.price - a.price;
      if (sortOrder === 'price-asc') return a.price - b.price;
      return 0;
    });
  }, [reservationsData, activeTab, searchQuery, sortOrder]);

  const openDetail = (id: string) => {
    setSelectedResaId(id);
    setModalOpen('detail');
  };

  const selectedResa = reservationsData.find(r => r.id === selectedResaId);

  // Dynamic KPI calculations
  const totalReservations = reservationsData.length;
  const upcomingReservations = reservationsData.filter(r => r.status === 'confirmed').length;
  const pendingReservations = reservationsData.filter(r => r.status === 'pending' || r.status === 'payment').length;
  const totalSpent = reservationsData.reduce((acc, curr) => acc + curr.price, 0);

  const counts = {
    all: reservationsData.length,
    confirmed: reservationsData.filter(r => r.status === 'confirmed').length,
    pending: reservationsData.filter(r => r.status === 'pending').length,
    payment: reservationsData.filter(r => r.status === 'payment').length,
    completed: reservationsData.filter(r => r.status === 'completed').length,
    cancelled: reservationsData.filter(r => r.status === 'cancelled').length,
  };

  if (loading) {
    return <div className="reservations-container"><div style={{ padding: '4rem', textAlign: 'center' }}>Chargement de vos réservations...</div></div>;
  }

  return (
    <div className="dashboard-container reservations-container">
      <div className="app-layout">
        <DashboardSidebar activeSection="reservations" />
        
        <main className="main">
          <div className="page-wrap" style={{ padding: '0' }}>
            {/* HEADER */}
            <div className="page-header">
          <div className="page-header-left">
            <span className="page-eyebrow">Espace client</span>
            <h1 className="page-title">Mes <em>réservations</em></h1>
            <p className="page-subtitle">Consultez et gérez toutes vos réservations passées et à venir.</p>
          </div>
          <Link href="/listings" className="btn btn-gold" style={{ width: 'auto', textDecoration: 'none' }}>
            ⚓ Explorer les yachts
          </Link>
        </div>

        {/* KPI CARDS */}
        <div className="kpi-row">
          <div className="kpi-card reveal">
            <div className="kpi-label">Total réservations</div>
            <div className="kpi-value">{totalReservations}</div>
            <div className="kpi-sub">depuis votre inscription</div>
          </div>
          <div className="kpi-card reveal">
            <div className="kpi-label">À venir</div>
            <div className="kpi-value">{upcomingReservations}</div>
            <div className="kpi-sub">réservations confirmées</div>
          </div>
          <div className="kpi-card reveal">
            <div className="kpi-label">En attente</div>
            <div className="kpi-value">{pendingReservations}</div>
            <div className="kpi-sub">en cours de traitement</div>
          </div>
          <div className="kpi-card navy-card reveal">
            <div className="kpi-label">Total dépensé</div>
            <div className="kpi-value">€{totalSpent.toLocaleString('fr-FR')}</div>
            <div className="kpi-sub">sur toutes les réservations</div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar">
          <div className="filter-tabs">
            {[
              { id: 'all', label: `Toutes (${counts.all})` },
              { id: 'confirmed', label: `Confirmées (${counts.confirmed})` },
              { id: 'pending', label: `En attente (${counts.pending})` },
              { id: 'payment', label: `Paiement (${counts.payment})` },
              { id: 'completed', label: `Terminées (${counts.completed})` },
              { id: 'cancelled', label: `Annulées (${counts.cancelled})` }
            ].map(t => (
              <button key={t.id} className={`filter-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Rechercher un bateau…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <select className="sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="date-desc">Plus récent</option>
              <option value="date-asc">Plus ancien</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="price-asc">Prix croissant</option>
            </select>
          </div>
        </div>

        {/* RESERVATIONS LIST */}
        <div className="reservations-list">
          {filteredReservations.length === 0 && (
            <div className="empty-state reveal">
              <div className="empty-icon">⚓</div>
              <div className="empty-title">Aucune réservation</div>
              <div className="empty-sub">Aucune réservation ne correspond à vos critères.</div>
            </div>
          )}

          {filteredReservations.map((resa, i) => (
            <div key={resa.id} className="resa-card reveal" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="resa-img">
                <div className="resa-img-inner" style={{ background: resa.img, opacity: resa.status === 'cancelled' ? 0.7 : 1 }}></div>
                <span className="resa-ref-badge">{resa.id}</span>
              </div>
              <div className="resa-body">
                <div>
                  <div className="resa-top">
                    <div>
                      <div className="resa-type">{resa.type}</div>
                      <div className="resa-name" style={{ opacity: resa.status === 'cancelled' ? 0.6 : 1 }}>{resa.name}</div>
                      <div className="resa-location">{resa.location}</div>
                    </div>
                    <span className={`status-badge ${resa.status}`}>
                      <span className="status-dot"></span>
                      {resa.status === 'payment' && 'Virement en attente'}
                      {resa.status === 'confirmed' && 'Confirmée'}
                      {resa.status === 'pending' && 'En attente'}
                      {resa.status === 'completed' && 'Terminée'}
                      {resa.status === 'cancelled' && 'Annulée'}
                    </span>
                  </div>
                  <div className="resa-meta">
                    <div className="resa-meta-item">
                      <div className="resa-meta-label">{resa.status === 'cancelled' ? 'Arrivée prévue' : 'Arrivée'}</div>
                      <div className="resa-meta-value" style={{ opacity: resa.status === 'cancelled' ? 0.6 : 1 }}>{resa.arrival}</div>
                    </div>
                    <div className="resa-meta-item">
                      <div className="resa-meta-label">{resa.status === 'cancelled' ? 'Départ prévu' : 'Départ'}</div>
                      <div className="resa-meta-value" style={{ opacity: resa.status === 'cancelled' ? 0.6 : 1 }}>{resa.departure}</div>
                    </div>
                    {resa.status !== 'cancelled' ? (
                      <>
                        <div className="resa-meta-item">
                          <div className="resa-meta-label">Invités</div>
                          <div className="resa-meta-value">{resa.guests}</div>
                        </div>
                        <div className="resa-meta-item">
                          <div className="resa-meta-label">Nuits</div>
                          <div className="resa-meta-value">{resa.nights} nuits</div>
                        </div>
                      </>
                    ) : (
                      <div className="resa-meta-item">
                        <div className="resa-meta-label">Motif</div>
                        <div className="resa-meta-value" style={{ fontSize: '.85rem', opacity: 0.7 }}>Preuve de virement non reçue (24h)</div>
                      </div>
                    )}
                  </div>

                  {/* ALERTS & PROGRESS */}
                  {resa.status === 'payment' && (
                    <>
                      <div className="resa-progress">
                        <div className="step-dot done"></div><div className="step-line done"></div>
                        <div className="step-dot done"></div><div className="step-line"></div>
                        <div className="step-dot active"></div><div className="step-line"></div>
                        <div className="step-dot"></div>
                      </div>
                      <div className="step-labels" style={{ padding: 0 }}>
                        <span className="step-label-item done" style={{ width: '25%' }}>Réservé</span>
                        <span className="step-label-item done" style={{ width: '25%', textAlign: 'center' }}>Paiement</span>
                        <span className="step-label-item active" style={{ width: '25%', textAlign: 'center' }}>Vérification</span>
                        <span className="step-label-item" style={{ width: '25%', textAlign: 'right' }}>Confirmé</span>
                      </div>
                      <div className="resa-alert warn">⏳ Votre preuve de virement est en cours de vérification par notre équipe. Confirmation sous 30–48h.</div>
                    </>
                  )}
                  {resa.status === 'confirmed' && (
                    <div className="resa-alert success">✅ Votre réservation est confirmée. Rendez-vous le {resa.arrival} au port.</div>
                  )}
                  {resa.status === 'pending' && (
                    <div className="resa-alert info">ℹ️ Votre demande a été transmise. Notre équipe la traite dans les 24h ouvrées.</div>
                  )}
                  {resa.status === 'completed' && (
                    <div style={{ marginTop: '.9rem', display: 'flex', gap: '.3rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '.72rem', color: 'var(--text-light)' }}>Votre note :</span>
                      <span style={{ color: '#e2a200', fontSize: '1rem' }}>★★★★★</span>
                      <span style={{ fontSize: '.72rem', color: 'var(--text-light)' }}>Déposé le 22 avr. 2025</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="resa-actions">
                <div className="resa-price">
                  <div className="resa-price-label">
                    {resa.status === 'payment' ? 'Total' : resa.status === 'confirmed' ? 'Total' : resa.status === 'pending' ? 'Total estimé' : resa.status === 'completed' ? 'Total payé' : 'Montant'}
                  </div>
                  <div className="resa-price-value" style={{ opacity: resa.status === 'cancelled' ? 0.5 : 1 }}>€{resa.price.toLocaleString()}</div>
                  <div className="resa-price-nights">{resa.nights} nuits · {resa.priceNote}</div>
                </div>
                <div className="resa-btns">
                  {resa.status === 'payment' && (
                    <>
                      <button className="btn btn-gold" onClick={() => setModalOpen('upload')}>📎 Renvoyer preuve</button>
                      <button className="btn btn-primary" onClick={() => openDetail(resa.id)}>Voir les détails</button>
                      <button className="btn btn-outline" onClick={() => startChat(resa)}>💬 Contacter</button>
                    </>
                  )}
                  {resa.status === 'confirmed' && (
                    <>
                      <button className="btn btn-primary" onClick={() => openDetail(resa.id)}>Voir les détails</button>
                      <button className="btn btn-outline" onClick={() => handleDownloadBookingFile(resa, 'Bon de réservation')}>📄 Bon de réservation</button>
                      <button className="btn btn-outline" onClick={() => startChat(resa)}>💬 Contacter</button>
                      <button className="btn btn-danger" onClick={() => triggerToast("Demande d'annulation envoyée à l'équipe.", '⚠️')}>Demander annulation</button>
                    </>
                  )}
                  {resa.status === 'pending' && (
                    <>
                      <button className="btn btn-primary" onClick={() => openDetail(resa.id)}>Voir les détails</button>
                      <button className="btn btn-outline" onClick={() => startChat(resa)}>💬 Contacter</button>
                      <button className="btn btn-danger" onClick={() => triggerToast('Réservation annulée.', '❌')}>Annuler</button>
                    </>
                  )}
                  {resa.status === 'completed' && (
                    <>
                      <button className="btn btn-primary" onClick={() => openDetail(resa.id)}>Voir les détails</button>
                      <button className="btn btn-outline" onClick={() => triggerToast('Téléchargement de la facture...', '📄')}>📄 Facture PDF</button>
                      <button className="btn btn-outline" onClick={() => triggerToast('Redirection vers la page du bateau...', '🔁')}>🔁 Re-réserver</button>
                    </>
                  )}
                  {resa.status === 'cancelled' && (
                    <>
                      <button className="btn btn-outline" onClick={() => openDetail(resa.id)}>Voir le détail</button>
                      <button className="btn btn-outline" onClick={() => triggerToast('Redirection vers la page du bateau...', '🔁')}>🔁 Re-réserver</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <span className="pagination-info">Affichage 1–{filteredReservations.length} sur {filteredReservations.length} réservations</span>
          <div className="pagination-btns">
            <button className="pag-btn">‹</button>
            <button className="pag-btn active">1</button>
            <button className="pag-btn">›</button>
          </div>
        </div>
          </div>
        </main>
      </div>

      {/* ── DETAIL MODAL ── */}
      <div className={`modal-overlay ${modalOpen === 'detail' ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-header">
            <span className="modal-title">Réservation {selectedResaId}</span>
            <button className="modal-close" onClick={() => setModalOpen('')}>✕</button>
          </div>
          <div className="modal-body">
            {selectedResa && (
              <>
                <div className="modal-section">
                  <div className="modal-section-title">Bateau</div>
                  <div className="modal-row"><span className="modal-row-label">Nom</span><span className="modal-row-value">{selectedResa.name}</span></div>
                  <div className="modal-row"><span className="modal-row-label">Type</span><span className="modal-row-value">{selectedResa.type}</span></div>
                  <div className="modal-row"><span className="modal-row-label">Port d'attache</span><span className="modal-row-value">{selectedResa.location.replace('📍 ', '')}</span></div>
                </div>
                <div className="modal-section">
                  <div className="modal-section-title">Réservation</div>
                  <div className="modal-row"><span className="modal-row-label">Dates</span><span className="modal-row-value">{selectedResa.arrival} → {selectedResa.departure}</span></div>
                  {selectedResa.status !== 'cancelled' && <div className="modal-row"><span className="modal-row-label">Invités</span><span className="modal-row-value">{selectedResa.guests}</span></div>}
                </div>
                <div className="modal-total">
                  <span className="modal-total-label">Total ({selectedResa.priceNote})</span>
                  <span className="modal-total-value">€{selectedResa.price.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="modal-btn secondary" onClick={() => setModalOpen('')}>Fermer</button>
            <button className="modal-btn primary" onClick={() => { setModalOpen(''); handleDownloadBookingFile(selectedResa, 'Récapitulatif'); }}>📄 Télécharger le récapitulatif</button>
          </div>
        </div>
      </div>

      {/* ── UPLOAD MODAL ── */}
      <div className={`modal-overlay ${modalOpen === 'upload' ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-header">
            <span className="modal-title">Joindre une preuve de virement</span>
            <button className="modal-close" onClick={() => setModalOpen('')}>✕</button>
          </div>
          <div className="modal-body">
            <p style={{ fontSize: '.88rem', color: 'var(--text-mid)', marginBottom: '1rem', lineHeight: 1.7 }}>
              Veuillez joindre l'ordre de virement ou la capture de confirmation émis par votre banque.
            </p>
            <div style={{ background: 'var(--status-payment-bg)', border: '1px solid var(--status-payment-bdr)', padding: '.9rem 1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '.72rem', color: 'var(--status-payment-txt)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '.3rem' }}>Référence à indiquer sur le virement</div>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', color: 'var(--navy)', fontWeight: 600, letterSpacing: '.05em' }}>REF-CK7X9M</div>
            </div>
            {!fileSelected ? (
              <label className="upload-zone" style={{ display: 'block' }}>
                <div style={{ fontSize: '2rem' }}>📎</div>
                <p>Cliquez pour sélectionner un document</p>
                <small>PDF, JPG, PNG — max 10 Mo</small>
                <input type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.png" onChange={e => { if(e.target.files?.[0]) setFileSelected(e.target.files[0]) }} />
              </label>
            ) : (
              <div className="upload-done" style={{ display: 'flex' }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                <div>
                  <div className="upload-done-text">{fileSelected.name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--status-confirmed-txt)', marginTop: '.2rem' }}>Prêt à être envoyé</div>
                </div>
                <button onClick={() => setFileSelected(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-light)' }}>✕</button>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="modal-btn secondary" onClick={() => setModalOpen('')}>Annuler</button>
            <button className="modal-btn primary" onClick={() => { if(fileSelected) { setModalOpen(''); triggerToast('Preuve envoyée ! Notre équipe va la vérifier.', '🚀'); setFileSelected(null); } else { triggerToast('Veuillez sélectionner un fichier', '⚠️'); } }}>ENVOYER</button>
          </div>
        </div>
      </div>

      {/* ── CHAT MODAL ── */}
      <div className={`modal-overlay ${chatModalOpen ? 'open' : ''}`}>
        <div className="modal" style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <div className="modal-header">
            <div>
              <span className="modal-title">Contacter le propriétaire</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>{activeChatResa?.name}</div>
            </div>
            <button className="modal-close" onClick={() => setChatModalOpen(false)}>✕</button>
          </div>
          
          <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                Envoyez un message au propriétaire pour toute question concernant votre réservation.
              </div>
            )}
            
            {messages.map(msg => {
              const isOutgoing = msg.senderId === currentUserId;
              const msgTime = new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              return (
                <div key={msg.id} style={{
                  maxWidth: '85%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                  background: isOutgoing ? 'var(--navy)' : '#fff',
                  color: isOutgoing ? '#fff' : 'var(--text-main)',
                  border: isOutgoing ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ lineHeight: 1.4 }}>{msg.content}</div>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.4rem', textAlign: 'right', opacity: 0.7, color: isOutgoing ? '#e2e8f0' : 'var(--text-light)' }}>
                    {msgTime}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="modal-footer" style={{ padding: '1rem', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
            <textarea 
              placeholder="Écrivez votre message..." 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)} 
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMsg();
                }
              }}
              rows={1}
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none', fontFamily: 'inherit' }} 
            />
            <button 
              onClick={sendMsg}
              style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--gold)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span className="toast-icon">{toastIcon}</span>
        <span>{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Chargement...</div>}>
      <ReservationsContent />
    </Suspense>
  );
}
