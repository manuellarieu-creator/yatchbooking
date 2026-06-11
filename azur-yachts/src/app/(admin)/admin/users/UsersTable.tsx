'use client';

import { useState } from 'react';
import { User, UserStatus } from '@prisma/client';

export default function UsersTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredUsers = tab === 'pending' 
    ? users.filter(u => u.status === 'PENDING' && u.role === 'ADVERTISER')
    : users;

  const handleStatusUpdate = async (id: string, newStatus: UserStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
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
          <h1 className="admin-title">Utilisateurs & Annonceurs</h1>
          <p className="admin-subtitle">Gérez les comptes de la plateforme et validez les nouveaux annonceurs.</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          En attente de validation ({users.filter(u => u.status === 'PENDING' && u.role === 'ADVERTISER').length})
        </button>
        <button className={`admin-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          Tous les utilisateurs ({users.length})
        </button>
      </div>

      <div className="admin-table-card">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">Aucun utilisateur trouvé dans cette catégorie.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Contact</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.id}</div>
                  </td>
                  <td>
                    <div>{user.email}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.phone || 'Non renseigné'}</div>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: user.role === 'ADVERTISER' ? '#d4b57a' : '#475569',
                      background: user.role === 'ADVERTISER' ? '#fdf8f0' : '#f1f5f9',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="action-group">
                      {user.status === 'PENDING' && user.role === 'ADVERTISER' && (
                        <>
                          <button 
                            className="action-btn btn-approve" 
                            disabled={loadingId === user.id}
                            onClick={() => handleStatusUpdate(user.id, 'ACTIVE')}
                          >
                            {loadingId === user.id ? '...' : '✅ Approuver'}
                          </button>
                          <button 
                            className="action-btn btn-reject"
                            disabled={loadingId === user.id}
                            onClick={() => handleStatusUpdate(user.id, 'REJECTED')}
                          >
                            {loadingId === user.id ? '...' : '❌ Rejeter'}
                          </button>
                        </>
                      )}
                      {user.status === 'ACTIVE' && user.role === 'ADVERTISER' && (
                        <button 
                          className="action-btn btn-reject"
                          disabled={loadingId === user.id}
                          onClick={() => handleStatusUpdate(user.id, 'SUSPENDED')}
                        >
                          {loadingId === user.id ? '...' : 'Suspendre'}
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
