'use client';

import { useState } from 'react';
import { Destination } from '@prisma/client';

export default function DestinationsTable({ destinations: initialDestinations }: { destinations: Destination[] }) {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Destination & { imageBase64: string }>>({});
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette destination ?')) return;
    try {
      await fetch(`/api/admin/destinations/${id}`, { method: 'DELETE' });
      setDestinations(destinations.filter(d => d.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = formData.id ? `/api/admin/destinations/${formData.id}` : '/api/admin/destinations';
      const method = formData.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.destination) {
        if (formData.id) {
          setDestinations(destinations.map(d => d.id === formData.id ? data.destination : d));
        } else {
          setDestinations([...destinations, data.destination]);
        }
        setIsCreating(false);
        setFormData({});
      } else {
        alert(data.error || "Erreur serveur");
      }
    } catch (err) {
      alert("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Destinations</h1>
          <p className="admin-subtitle">Gérez les destinations qui s'affichent sur la page d'accueil.</p>
        </div>
        <button className="action-btn btn-approve" onClick={() => { setIsCreating(true); setFormData({ isLarge: false, isActive: true, order: 0 }); }}>
          + Nouvelle Destination
        </button>
      </div>

      {isCreating && (
        <div className="admin-table-card" style={{ marginBottom: '2rem' }}>
          <h3>{formData.id ? 'Modifier la destination' : 'Créer une destination'}</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label>Nom (doit correspondre au pays ou port d'attache)</label>
              <input type="text" className="form-input" style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label>Image d'arrière-plan (Upload)</label>
              <input 
                type="file" 
                accept="image/*"
                className="form-input" 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }} 
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({...formData, imageBase64: reader.result as string});
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              {(formData as any).imageBase64 ? (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>✓ Image prête à être envoyée</div>
              ) : null}
            </div>
            <div>
              <label>Ou bien, coller l'URL d'une image directement</label>
              <input type="text" className="form-input" placeholder="https://..." style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            </div>
            <div>
              <label>Gradient CSS (Fallback) ex: linear-gradient(135deg, #1a5a80, #0a2540)</label>
              <input type="text" className="form-input" style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }} value={formData.gradient || ''} onChange={e => setFormData({...formData, gradient: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={formData.isLarge || false} onChange={e => setFormData({...formData, isLarge: e.target.checked})} />
                Format Large (Populaire)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={formData.isActive || false} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                Actif
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="action-btn btn-approve" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              <button type="button" className="action-btn" onClick={() => setIsCreating(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-card">
        {destinations.length === 0 ? (
          <div className="empty-state">Aucune destination configurée.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Aperçu</th>
                <th>Statut</th>
                <th>Taille</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map(dest => (
                <tr key={dest.id}>
                  <td style={{ fontWeight: 600 }}>{dest.name}</td>
                  <td>
                    <div style={{ 
                      width: '80px', height: '40px', borderRadius: '4px', 
                      background: dest.imageUrl ? `url(${dest.imageUrl}) center/cover` : dest.gradient || '#ccc' 
                    }}></div>
                  </td>
                  <td>{dest.isActive ? '✅ Actif' : '❌ Inactif'}</td>
                  <td>{dest.isLarge ? 'Large' : 'Normal'}</td>
                  <td>
                    <div className="action-group">
                      <button className="action-btn" onClick={() => { setFormData(dest); setIsCreating(true); }}>Modifier</button>
                      <button className="action-btn btn-reject" onClick={() => handleDelete(dest.id)}>Supprimer</button>
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
