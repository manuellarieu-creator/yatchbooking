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

      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #eaeaea' }}>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Date d'inscription</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Aucun abonné pour le moment.</td></tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{sub.email}</td>
                  <td style={{ padding: '1rem', color: '#666' }}>
                    {new Date(sub.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      style={{ background: '#fff0f0', color: '#d32f2f', border: '1px solid #fcc', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
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
