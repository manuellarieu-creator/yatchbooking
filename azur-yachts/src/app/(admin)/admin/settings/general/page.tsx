'use client';

import { useState, useEffect } from 'react';

export default function GeneralSettingsPage() {
  const [satisfiedClients, setSatisfiedClients] = useState('');
  const [yearsOfExcellence, setYearsOfExcellence] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSatisfiedClients(data.satisfiedClients || '');
          setYearsOfExcellence(data.yearsOfExcellence || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ satisfiedClients, yearsOfExcellence })
      });
      if (res.ok) {
        alert('Paramètres enregistrés avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    } catch (e) {
      alert('Erreur réseau.');
    }
    setSaving(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Paramètres Généraux</h1>
        <p>Gérez les informations globales affichées sur le site.</p>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '600px', border: '1px solid #eaeaea' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Clients satisfaits</label>
          <input 
            type="text" 
            value={satisfiedClients} 
            onChange={(e) => setSatisfiedClients(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="Ex: 12K+"
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Affiché dans la barre de statistiques de la page d'accueil.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Années d'excellence</label>
          <input 
            type="text" 
            value={yearsOfExcellence} 
            onChange={(e) => setYearsOfExcellence(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="Ex: 15"
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Affiché dans la barre de statistiques de la page d'accueil.</p>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ background: 'var(--ocean)', color: 'white', padding: '0.8rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </div>
  );
}
