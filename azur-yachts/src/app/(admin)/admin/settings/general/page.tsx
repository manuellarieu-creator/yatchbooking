'use client';

import { useState, useEffect } from 'react';

export default function GeneralSettingsPage() {
  const [satisfiedClients, setSatisfiedClients] = useState('');
  const [yearsOfExcellence, setYearsOfExcellence] = useState('');
  const [totalYachts, setTotalYachts] = useState(0);
  const [totalDestinations, setTotalDestinations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSatisfiedClients(data.satisfiedClients || '');
          setYearsOfExcellence(data.yearsOfExcellence || '');
          setTotalYachts(data.totalYachts || 0);
          setTotalDestinations(data.totalDestinations || 0);
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#666' }}>Yachts disponibles</label>
            <input 
              type="text" 
              value={totalYachts} 
              disabled
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', color: '#666', cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem' }}>Calculé automatiquement.</p>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#666' }}>Destinations mondiales</label>
            <input 
              type="text" 
              value={totalDestinations} 
              disabled
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', color: '#666', cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem' }}>Calculé automatiquement.</p>
          </div>
        </div>

        <hr style={{ borderTop: '1px solid #eaeaea', marginBottom: '2rem' }} />

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Clients satisfaits</label>
          <input 
            type="text" 
            value={satisfiedClients} 
            onChange={(e) => setSatisfiedClients(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
            placeholder="Ex: 12K+"
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Modifiable. S'affiche sur l'accueil.</p>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Années d'excellence</label>
          <input 
            type="text" 
            value={yearsOfExcellence} 
            onChange={(e) => setYearsOfExcellence(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
            placeholder="Ex: 15"
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Modifiable. S'affiche sur l'accueil.</p>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ 
            background: 'var(--ocean)', 
            color: 'white', 
            padding: '1rem 2rem', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontWeight: 700, 
            fontSize: '1.1rem',
            width: '100%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'background 0.2s'
          }}
        >
          {saving ? '⏳ Sauvegarde en cours...' : '💾 Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}
