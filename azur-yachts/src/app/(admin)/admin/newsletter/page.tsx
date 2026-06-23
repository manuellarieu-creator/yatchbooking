'use client';

import { useState, useEffect } from 'react';

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/newsletter');
      const data = await res.json();
      if (Array.isArray(data)) setSubscribers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet abonné ?')) return;
    try {
      await fetch('/api/admin/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setSubscribers(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Newsletter ({subscribers.length})</h1>
        <p>Gérez les abonnés à votre newsletter.</p>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Date d'inscription</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Aucun abonné pour le moment.</td></tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td data-label="Email" style={{ fontWeight: 500 }}>{sub.email}</td>
                  <td data-label="Date d'inscription" style={{ color: '#666' }}>
                    {new Date(sub.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      className="action-btn"
                      style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #fcc' }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
