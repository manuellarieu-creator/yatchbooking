'use client';

import { useState } from 'react';
import { Blacklist } from '@prisma/client';

export default function BlacklistTable({ blacklist: initialBlacklist }: { blacklist: Blacklist[] }) {
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRemoveFromBlacklist = async (id: string, email: string) => {
    if (!confirm(`Voulez-vous vraiment retirer l'email ${email} de la liste noire ? Il pourra à nouveau s'inscrire.`)) return;
    
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/blacklist/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBlacklist(blacklist.filter(b => b.id !== id));
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
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Liste Noire (Blacklist)</h1>
          <p className="admin-subtitle">Gérez les adresses email bloquées pour empêcher les réinscriptions indésirables.</p>
        </div>
      </div>

      <div className="admin-table-card">
        {blacklist.length === 0 ? (
          <div className="empty-state">La liste noire est vide.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email Bloqué</th>
                <th>Motif</th>
                <th>Date de blocage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blacklist.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{entry.email}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{entry.id}</div>
                  </td>
                  <td>
                    <div style={{ color: '#be123c' }}>{entry.reason || 'Aucun motif fourni'}</div>
                  </td>
                  <td>{new Date(entry.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="action-group">
                      <button 
                        className="action-btn"
                        style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                        disabled={loadingId === entry.id}
                        onClick={() => handleRemoveFromBlacklist(entry.id, entry.email)}
                        title="Débloquer cet email"
                      >
                        {loadingId === entry.id ? '...' : '🔓 Débloquer'}
                      </button>
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
