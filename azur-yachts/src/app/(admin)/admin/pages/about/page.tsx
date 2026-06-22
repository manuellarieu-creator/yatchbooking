'use client';

import { useState, useEffect } from 'react';

export default function AdminAboutPage() {
  const [yearsOfExcellence, setYearsOfExcellence] = useState<number>(4);
  const [foundationYear, setFoundationYear] = useState<number>(2022);
  const [foundationLocation, setFoundationLocation] = useState('La Ciotat');
  const [satisfiedClients, setSatisfiedClients] = useState('12000+');
  const [satisfactionRate, setSatisfactionRate] = useState('98%');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pages/about')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setYearsOfExcellence(data.yearsOfExcellence || 4);
          setFoundationYear(data.foundationYear || 2022);
          setFoundationLocation(data.foundationLocation || 'La Ciotat');
          setSatisfiedClients(data.satisfiedClients || '12000+');
          setSatisfactionRate(data.satisfactionRate || '98%');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pages/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearsOfExcellence,
          foundationYear,
          foundationLocation,
          satisfiedClients,
          satisfactionRate
        })
      });
      if (res.ok) {
        alert('Paramètres de la page "À propos" enregistrés avec succès !');
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
        <h1>Édition de la page "À propos"</h1>
        <p>Modifiez les informations textuelles et les statistiques affichées publiquement sur la page À propos.</p>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '600px', border: '1px solid #eaeaea' }}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Années d'expertise</label>
          <input 
            type="number" 
            value={yearsOfExcellence} 
            onChange={(e) => setYearsOfExcellence(Number(e.target.value))}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Ex: 4. Met à jour le compteur sur la page.</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Année de fondation</label>
          <input 
            type="number" 
            value={foundationYear} 
            onChange={(e) => setFoundationYear(Number(e.target.value))}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Ex: 2022. Mis à jour dans le texte et la timeline.</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Lieu de fondation</label>
          <input 
            type="text" 
            value={foundationLocation} 
            onChange={(e) => setFoundationLocation(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Ex: La Ciotat.</p>
        </div>

        <hr style={{ borderTop: '1px solid #eaeaea', margin: '2rem 0' }} />

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Clients satisfaits</label>
          <input 
            type="text" 
            value={satisfiedClients} 
            onChange={(e) => setSatisfiedClients(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Ex: 12000+</p>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Taux de satisfaction</label>
          <input 
            type="text" 
            value={satisfactionRate} 
            onChange={(e) => setSatisfactionRate(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
          />
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Ex: 98%</p>
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
