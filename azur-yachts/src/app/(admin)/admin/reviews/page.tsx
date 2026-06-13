'use client';

import { useState, useEffect } from 'react';
import { ReviewStatus } from '@prisma/client';

type Review = {
  id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  targetType: string;
  createdAt: string;
  listing?: { id: string; title: string };
  targetUser?: { id: string; firstName: string; lastName: string };
  author: { id: string; firstName: string; lastName: string; email: string };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewStatus | 'ALL'>('PENDING');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleAction = async (id: string, status: ReviewStatus) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
      } else {
        alert(data.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      alert("Erreur réseau");
    }
    setActionLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet avis définitivement ?')) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      alert("Erreur réseau");
    }
    setActionLoadingId(null);
  };

  const filteredReviews = filter === 'ALL' ? reviews : reviews.filter(r => r.status === filter);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Modération des Avis</h1>
          <p className="admin-subtitle">Gérez et validez les avis laissés par les clients avant publication.</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>
          En attente ({reviews.filter(r => r.status === 'PENDING').length})
        </button>
        <button className={`admin-tab ${filter === 'APPROVED' ? 'active' : ''}`} onClick={() => setFilter('APPROVED')}>
          Approuvés ({reviews.filter(r => r.status === 'APPROVED').length})
        </button>
        <button className={`admin-tab ${filter === 'REJECTED' ? 'active' : ''}`} onClick={() => setFilter('REJECTED')}>
          Rejetés ({reviews.filter(r => r.status === 'REJECTED').length})
        </button>
        <button className={`admin-tab ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>
          Tous ({reviews.length})
        </button>
      </div>

      <div className="admin-table-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div>Chargement...</div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ color: '#64748b' }}>Aucun avis dans cette catégorie.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredReviews.map(review => (
              <div key={review.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                      {review.rating} / 5 ⭐ sur {
                        review.targetType === 'SITE' ? 'le Site' :
                        review.targetType === 'OWNER' ? `le Propriétaire (${review.targetUser?.firstName || ''} ${review.targetUser?.lastName || ''})` :
                        review.listing?.title || 'Annonce supprimée'
                      }
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Par {review.author.firstName} {review.author.lastName} ({review.author.email}) le {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      background: review.status === 'PENDING' ? '#fef3c7' : review.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                      color: review.status === 'PENDING' ? '#d97706' : review.status === 'APPROVED' ? '#166534' : '#991b1b'
                    }}>
                      {review.status}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '1rem', fontStyle: 'italic', color: '#334155' }}>
                  "{review.comment}"
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  {review.status !== 'APPROVED' && (
                    <button 
                      onClick={() => handleAction(review.id, 'APPROVED')}
                      disabled={actionLoadingId === review.id}
                      style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      {actionLoadingId === review.id ? '...' : '✅ Approuver'}
                    </button>
                  )}
                  {review.status !== 'REJECTED' && (
                    <button 
                      onClick={() => handleAction(review.id, 'REJECTED')}
                      disabled={actionLoadingId === review.id}
                      style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      {actionLoadingId === review.id ? '...' : '❌ Rejeter'}
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(review.id)}
                    disabled={actionLoadingId === review.id}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
