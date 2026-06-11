'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import './reservations.css';

const RESERVATIONS = [
  {
    id: 'REF-CK7X9M',
    status: 'payment',
    type: 'Superyacht · Motor',
    name: 'Azura Prestige 68',
    location: "📍 Côte d'Azur, France",
    img: 'linear-gradient(135deg,#1a3a5a,#0a2040)',
    arrival: '14 juin 2025',
    departure: '21 juin 2025',
    guests: '4 adultes, 2 enfants',
    nights: 7,
    price: 34200,
    priceNote: 'virement SEPA',
    dateValue: new Date('2025-06-14').getTime(),
  },
  {
    id: 'REF-BN2K4P',
    status: 'confirmed',
    type: 'Catamaran · Voile',
    name: 'Liberté Bleue 52',
    location: "📍 Santorin, Grèce",
    img: 'linear-gradient(135deg,#1a4a6e,#0a2a40)',
    arrival: '3 août 2025',
    departure: '10 août 2025',
    guests: '2 adultes',
    nights: 7,
    price: 20300,
    priceNote: 'Stripe',
    dateValue: new Date('2025-08-03').getTime(),
  },
  {
    id: 'REF-QW5R8T',
    status: 'pending',
    type: 'Voilier classique',
    name: 'Belle Époque 44',
    location: "📍 Porto Cervo, Sardaigne",
    img: 'linear-gradient(135deg,#3a2a1a,#2a1a0a)',
    arrival: '10 sept. 2025',
    departure: '17 sept. 2025',
    guests: '3 adultes, 1 enfant',
    nights: 7,
    price: 11550,
    priceNote: 'paiement en attente',
    dateValue: new Date('2025-09-10').getTime(),
  },
  {
    id: 'REF-MT3H7J',
    status: 'completed',
    type: 'Motor Yacht',
    name: 'Sea Spirit 58',
    location: "📍 Ibiza, Espagne",
    img: 'linear-gradient(135deg,#0a3a2a,#052015)',
    arrival: '12 avr. 2025',
    departure: '19 avr. 2025',
    guests: '6 adultes',
    nights: 7,
    price: 16800,
    priceNote: 'PayPal',
    dateValue: new Date('2025-04-12').getTime(),
  },
  {
    id: 'REF-HY9P2L',
    status: 'cancelled',
    type: 'Voilier',
    name: 'Adriatic Queen 46',
    location: "📍 Dubrovnik, Croatie",
    img: 'linear-gradient(135deg,#3a1a1a,#200a0a)',
    arrival: '1 mai 2025',
    departure: '8 mai 2025',
    guests: '-',
    nights: 7,
    price: 9800,
    priceNote: 'Non débité',
    dateValue: new Date('2025-05-01').getTime(),
  }
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');
  
  const [modalOpen, setModalOpen] = useState('');
  const [selectedResaId, setSelectedResaId] = useState('');
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  const [toastMsg, setToastMsg] = useState('');
  const [toastIcon, setToastIcon] = useState('✅');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string, icon = '✅') => {
    setToastMsg(msg);
    setToastIcon(icon);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  const filteredReservations = useMemo(() => {
    return RESERVATIONS.filter(r => {
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
  }, [activeTab, searchQuery, sortOrder]);

  const openDetail = (id: string) => {
    setSelectedResaId(id);
    setModalOpen('detail');
  };

  const selectedResa = RESERVATIONS.find(r => r.id === selectedResaId);

  return (
    <div className="reservations-container">


      <div className="page-wrap">
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
            <div className="kpi-value">7</div>
            <div className="kpi-sub">depuis votre inscription</div>
          </div>
          <div className="kpi-card reveal">
            <div className="kpi-label">À venir</div>
            <div className="kpi-value">2</div>
            <div className="kpi-sub">réservations confirmées</div>
          </div>
          <div className="kpi-card reveal">
            <div className="kpi-label">En attente</div>
            <div className="kpi-value">1</div>
            <div className="kpi-sub">en cours de traitement</div>
          </div>
          <div className="kpi-card navy-card reveal">
            <div className="kpi-label">Total dépensé</div>
            <div className="kpi-value">€18 450</div>
            <div className="kpi-sub">sur toutes les réservations</div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="toolbar">
          <div className="filter-tabs">
            {[
              { id: 'all', label: 'Toutes (5)' },
              { id: 'confirmed', label: 'Confirmées (1)' },
              { id: 'pending', label: 'En attente (1)' },
              { id: 'payment', label: 'Paiement (1)' },
              { id: 'completed', label: 'Terminées (1)' },
              { id: 'cancelled', label: 'Annulées (1)' }
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
                      <button className="btn btn-outline" onClick={() => triggerToast('Redirection vers la messagerie...', '💬')}>💬 Contacter</button>
                    </>
                  )}
                  {resa.status === 'confirmed' && (
                    <>
                      <button className="btn btn-primary" onClick={() => openDetail(resa.id)}>Voir les détails</button>
                      <button className="btn btn-outline" onClick={() => triggerToast('Téléchargement du bon...', '📄')}>📄 Bon de réservation</button>
                      <button className="btn btn-outline" onClick={() => triggerToast('Redirection vers la messagerie...', '💬')}>💬 Contacter</button>
                      <button className="btn btn-danger" onClick={() => triggerToast("Demande d'annulation envoyée à l'équipe.", '⚠️')}>Demander annulation</button>
                    </>
                  )}
                  {resa.status === 'pending' && (
                    <>
                      <button className="btn btn-primary" onClick={() => openDetail(resa.id)}>Voir les détails</button>
                      <button className="btn btn-outline" onClick={() => triggerToast('Redirection vers la messagerie...', '💬')}>💬 Contacter</button>
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
            <button className="modal-btn primary" onClick={() => { setModalOpen(''); triggerToast('Récapitulatif téléchargé.', '📄'); }}>📄 Télécharger le récapitulatif</button>
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

      {/* ── TOAST ── */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span className="toast-icon">{toastIcon}</span>
        <span>{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
