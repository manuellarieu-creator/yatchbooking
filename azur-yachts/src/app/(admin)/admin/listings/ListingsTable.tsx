'use client';

import { useState } from 'react';
import { Listing, ListingStatus, User } from '@prisma/client';
import Link from 'next/link';

type ListingWithOwner = Listing & { owner: { firstName: string, lastName: string, email: string } };

export default function ListingsTable({ listings: initialListings }: { listings: ListingWithOwner[] }) {
  const [listings, setListings] = useState(initialListings);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
        <Link href="/publish" style={{ background: '#0f172a', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    <div className="action-group">
                      <Link href={`/yachts/${listing.id}`} target="_blank" className="action-btn btn-view">
                        👁️ Voir
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
    </div>
  );
}
