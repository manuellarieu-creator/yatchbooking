'use client';

import { useState } from 'react';
import { User, UserStatus } from '@prisma/client';

export default function UsersTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [chkIdentity, setChkIdentity] = useState(false);
  const [chkDocument, setChkDocument] = useState(false);
  const [chkAudio, setChkAudio] = useState(false);

  const filteredUsers = tab === 'pending' 
    ? users.filter(u => u.status === 'PENDING')
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
        setSelectedUser(null);
      } else {
        alert(data.error || "Erreur serveur");
      }
    } catch (err) {
      alert("Erreur réseau");
    }
    setLoadingId(null);
  };

  const handleDeleteUser = async (id: string, blacklist: boolean) => {
    if (!confirm(blacklist ? "Voulez-vous vraiment supprimer et bloquer cet utilisateur (Blacklist) ?" : "Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}${blacklist ? '?blacklist=true' : ''}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
        setSelectedUser(null);
      } else {
        alert(data.error || "Erreur serveur");
      }
    } catch (err) {
      alert("Erreur réseau");
    }
    setLoadingId(null);
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setChkIdentity(false);
    setChkDocument(false);
    setChkAudio(false);
  };

  const isKycValid = chkIdentity && chkDocument && chkAudio;

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
          En attente de validation ({users.filter(u => u.status === 'PENDING').length})
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
                      <button 
                        className="action-btn" 
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' }}
                        onClick={() => openModal(user)}
                      >
                        🔍 Examiner
                      </button>
                      {user.status === 'ACTIVE' && (
                        <button 
                          className="action-btn btn-reject"
                          disabled={loadingId === user.id}
                          onClick={() => handleStatusUpdate(user.id, 'SUSPENDED')}
                        >
                          {loadingId === user.id ? '...' : 'Suspendre'}
                        </button>
                      )}
                      <button 
                        className="action-btn"
                        style={{ background: '#fee2e2', color: '#b91c1c', border: 'none' }}
                        disabled={loadingId === user.id}
                        onClick={() => handleDeleteUser(user.id, false)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* KYC Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#0f172a' }}>Dossier de {selectedUser.firstName} {selectedUser.lastName}</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedUser.email} · Inscrit le {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Contact</strong>
                <div style={{ fontSize: '0.85rem' }}>
                  <div>📧 {selectedUser.email}</div>
                  <div>📞 {selectedUser.phone || 'Non renseigné'}</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Profil</strong>
                <div style={{ fontSize: '0.85rem' }}>
                  <div><strong>Rôle:</strong> {selectedUser.role}</div>
                  <div><strong>Pays:</strong> {selectedUser.countryResidence || 'Non renseigné'}</div>
                </div>
              </div>
              {selectedUser.role === 'ADVERTISER' && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1' }}>
                  <strong style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Langues parlées</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedUser.languages && selectedUser.languages.length > 0 ? (
                      selectedUser.languages.map((lang, idx) => (
                        <span key={idx} style={{ background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: '#334155' }}>{lang}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Non renseigné</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedUser.role === 'ADVERTISER' && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Pièce d'Identité & Vidéo KYC</h3>
                
                {selectedUser.idCardUrl && (
                  <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>Document d'identité</h4>
                    {selectedUser.idCardUrl.endsWith('.pdf') ? (
                      <a href={selectedUser.idCardUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Voir le document PDF</a>
                    ) : (
                      <img src={selectedUser.idCardUrl} alt="Pièce d'identité" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} />
                    )}
                  </div>
                )}
                {selectedUser.videoUrl ? (
                  <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <video controls src={selectedUser.videoUrl} style={{ width: '100%', maxHeight: '350px' }} />
                  </div>
                ) : (
                  <div style={{ padding: '1rem', background: '#fff1f2', color: '#be123c', borderRadius: '8px', marginBottom: '1rem' }}>
                    Aucune vidéo KYC n'a été fournie par cet annonceur.
                  </div>
                )}

                {selectedUser.status === 'PENDING' && (
                  <div style={{ background: '#fdf8f0', padding: '1.25rem', borderRadius: '8px', border: '1px solid #f3e8d2' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#927334' }}>Critères de validation</h4>
                    <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={chkIdentity} onChange={e => setChkIdentity(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                      <span>L'identité annoncée correspond (Prénom/Nom)</span>
                    </label>
                    <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={chkDocument} onChange={e => setChkDocument(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                      <span>La pièce d'identité est bien visible, valide et lisible</span>
                    </label>
                    <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={chkAudio} onChange={e => setChkAudio(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                      <span>La déclaration audio est correcte et compréhensible</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleDeleteUser(selectedUser.id, false)}
                  disabled={loadingId === selectedUser.id}
                  style={{ padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  🗑️ Supprimer
                </button>
                <button 
                  onClick={() => handleDeleteUser(selectedUser.id, true)}
                  disabled={loadingId === selectedUser.id}
                  style={{ padding: '0.75rem 1rem', borderRadius: '6px', border: 'none', background: '#000', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  ⛔ Blacklist
                </button>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setSelectedUser(null)} style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Fermer</button>
                
                {selectedUser.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(selectedUser.id, 'REJECTED')}
                      disabled={loadingId === selectedUser.id}
                      style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}
                    >
                      {loadingId === selectedUser.id ? '...' : '❌ Rejeter'}
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedUser.id, 'ACTIVE')}
                      disabled={loadingId === selectedUser.id || (selectedUser.role === 'ADVERTISER' && !isKycValid)}
                      style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', background: (selectedUser.role === 'ADVERTISER' && !isKycValid) ? '#cbd5e1' : '#22c55e', color: '#fff', cursor: (selectedUser.role === 'ADVERTISER' && !isKycValid) ? 'not-allowed' : 'pointer' }}
                    >
                      {loadingId === selectedUser.id ? '...' : '✅ Approuver'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
