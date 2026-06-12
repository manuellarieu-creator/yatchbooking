'use client';

import { useState } from 'react';
import { Listing, ListingStatus, User } from '@prisma/client';
import Link from 'next/link';

type ListingWithOwner = Listing & { 
  owner: { firstName: string, lastName: string, email: string, phone?: string | null },
  images?: any[],
  services?: any[]
};

export default function ListingsTable({ listings: initialListings }: { listings: ListingWithOwner[] }) {
  const [listings, setListings] = useState(initialListings);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ListingWithOwner | null>(null);

  const filteredListings = tab === 'pending' 
    ? listings.filter(l => l.status === 'PENDING')
    : listings;

  const handleStatusUpdate = async (id: string, newStatus: ListingStatus) => {
    let rejectionReason = undefined;
    if (newStatus === 'REJECTED') {
      rejectionReason = prompt("Veuillez indiquer la raison du rejet (sera envoyée à l'annonceur) :");
      if (!rejectionReason) return; // Annulé par l'admin
    }

    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
      } else {
        alert(data.error || "Erreur serveur");
      }
    } catch (err) {
      alert("Erreur réseau");
    }
    setLoadingId(null);
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-title">Annonces Yachts</h1>
          <p className="admin-subtitle">Modérez et validez les nouvelles annonces soumises par les annonceurs.</p>
        </div>
        <Link href="/admin/listings/create" style={{ background: '#0f172a', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>+</span> Ajouter une annonce
        </Link>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          En attente de validation ({listings.filter(l => l.status === 'PENDING').length})
        </button>
        <button className={`admin-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          Toutes les annonces ({listings.length})
        </button>
      </div>

      <div className="admin-table-card">
        {filteredListings.length === 0 ? (
          <div className="empty-state">Aucune annonce trouvée dans cette catégorie.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre & Type</th>
                <th>Propriétaire</th>
                <th>Prix / Nuit</th>
                <th>Statut</th>
                <th>Date de soumission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map(listing => (
                <tr key={listing.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{listing.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{listing.boatType} · {listing.location}</div>
                  </td>
                  <td>
                    <div>{listing.owner.firstName} {listing.owner.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{listing.owner.email}</div>
                  </td>
                  <td>
                    <strong>€{listing.price.toLocaleString('fr-FR')}</strong>
                  </td>
                  <td>
                    <span className={`status-badge status-${listing.status.toLowerCase()}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td>{new Date(listing.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="action-group" style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="action-btn btn-view" onClick={() => setSelectedListing(listing)}>
                        👁️ Voir
                      </button>
                      <Link href={`/admin/listings/create?edit=${listing.id}`} className="action-btn btn-view" style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}>
                        ✏️ Éditer
                      </Link>
                      
                      {listing.status === 'PENDING' && (
                        <>
                          <button 
                            className="action-btn btn-approve" 
                            disabled={loadingId === listing.id}
                            onClick={() => handleStatusUpdate(listing.id, 'ACTIVE')}
                          >
                            {loadingId === listing.id ? '...' : '✅ Approuver'}
                          </button>
                          <button 
                            className="action-btn btn-reject"
                            disabled={loadingId === listing.id}
                            onClick={() => handleStatusUpdate(listing.id, 'REJECTED')}
                          >
                            {loadingId === listing.id ? '...' : '❌ Rejeter'}
                          </button>
                        </>
                      )}
                      
                      {listing.status === 'ACTIVE' && (
                        <button 
                          className="action-btn btn-reject"
                          disabled={loadingId === listing.id}
                          onClick={() => handleStatusUpdate(listing.id, 'INACTIVE')}
                        >
                          {loadingId === listing.id ? '...' : 'Désactiver'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedListing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setSelectedListing(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedListing(null)}>✕</button>
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{selectedListing.title}</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span className={`status-badge status-${selectedListing.status.toLowerCase()}`}>{selectedListing.status}</span>
              <span style={{ fontWeight: 600 }}>€{selectedListing.price.toLocaleString('fr-FR')} / jour</span>
              <span style={{ color: '#64748b' }}>📍 {selectedListing.location}, {selectedListing.country}</span>
              <span style={{ color: '#64748b' }}>⛵ {selectedListing.boatType} ({selectedListing.boatLength}m)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Détails de l'Annonceur</h3>
                <p><strong>Nom:</strong> {selectedListing.owner.firstName} {selectedListing.owner.lastName}</p>
                <p><strong>Email:</strong> {selectedListing.owner.email}</p>
                <p><strong>Téléphone:</strong> {selectedListing.owner.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Spécifications</h3>
                <p><strong>Capacité:</strong> {selectedListing.maxAdults} Adultes, {selectedListing.maxChildren} Enfants</p>
                <p><strong>Année:</strong> {selectedListing.boatYear}</p>
                <p><strong>Capitaine:</strong> {selectedListing.requiresCaptain ? 'Requis' : 'Non requis'} {selectedListing.skipperAvailable ? '(Skipper Optionnel)' : ''}</p>
                <p><strong>Heures / jour:</strong> {selectedListing.maxRentalHours || 24}h</p>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap', color: '#475569', marginBottom: '2rem' }}>{selectedListing.description}</p>

            {selectedListing.images && selectedListing.images.length > 0 && (
              <>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Photos ({selectedListing.images.length})</h3>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  {selectedListing.images.map(img => (
                    <img key={img.id} src={img.url} alt="Yacht" style={{ height: '100px', width: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                  ))}
                </div>
              </>
            )}

            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Tarification Additionnelle</h3>
            <p><strong>Frais de nettoyage:</strong> €{selectedListing.cleaningFee}</p>
            {selectedListing.deliveryAvailable && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Livraison disponible:</strong>
                {selectedListing.deliveryPricing ? (
                  <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                    {(selectedListing.deliveryPricing as any[]).map((dp, i) => (
                      <li key={i}>{dp.distance} : €{dp.fee}</li>
                    ))}
                  </ul>
                ) : (
                  <span> €{selectedListing.deliveryFee || 0}</span>
                )}
              </div>
            )}
            {selectedListing.services && selectedListing.services.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Services additionnels:</strong>
                <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                  {selectedListing.services.map(svc => (
                    <li key={svc.id}>{svc.name} - €{svc.price} ({svc.unit === 'PER_BOOKING' ? 'Par réservation' : svc.unit === 'PER_DAY' ? 'Par jour' : 'Par personne'})</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setSelectedListing(null)}>Fermer</button>
              {selectedListing.status === 'PENDING' && (
                <>
                  <button className="btn btn-reject" style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { handleStatusUpdate(selectedListing.id, 'REJECTED'); setSelectedListing(null); }}>Rejeter</button>
                  <button className="btn btn-approve" style={{ background: '#22c55e', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { handleStatusUpdate(selectedListing.id, 'ACTIVE'); setSelectedListing(null); }}>Approuver</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
