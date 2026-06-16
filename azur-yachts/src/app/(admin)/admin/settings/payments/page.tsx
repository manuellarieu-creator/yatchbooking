'use client';

import { useState, useEffect } from 'react';

export default function PaymentSettingsPage() {
  const [bankEnabled, setBankEnabled] = useState(false);
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankIban, setBankIban] = useState('');
  const [bankBic, setBankBic] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankNotificationEmail, setBankNotificationEmail] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings/payments')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setBankEnabled(data.bankEnabled || false);
          setBankAccountName(data.bankAccountName || '');
          setBankIban(data.bankIban || '');
          setBankBic(data.bankBic || '');
          setBankName(data.bankName || '');
          setBankNotificationEmail(data.bankNotificationEmail || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bankEnabled, 
          bankAccountName, 
          bankIban, 
          bankBic, 
          bankName, 
          bankNotificationEmail 
        })
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
        <h1>Paramètres de Paiement</h1>
        <p>Gérez les informations bancaires pour les virements.</p>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '600px', border: '1px solid #eaeaea' }}>
        
        <div style={{ marginBottom: '2.5rem', background: bankEnabled ? '#f0f9ff' : '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: `1px solid ${bankEnabled ? '#cce4f6' : '#eee'}`, display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <input 
            type="checkbox" 
            checked={bankEnabled}
            onChange={(e) => setBankEnabled(e.target.checked)}
            style={{ width: '20px', height: '20px', marginTop: '4px', cursor: 'pointer' }}
          />
          <div>
            <label style={{ display: 'block', fontWeight: 700, color: bankEnabled ? '#0288d1' : '#333', fontSize: '1.1rem', marginBottom: '0.3rem' }}>Activer le paiement par virement</label>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
              Permet aux clients de payer leur réservation par virement bancaire.
            </p>
          </div>
        </div>

        {bankEnabled && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Titulaire du compte</label>
              <input 
                type="text" 
                value={bankAccountName} 
                onChange={(e) => setBankAccountName(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
                placeholder="Ex: VOYYACHT SAS"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Banque</label>
              <input 
                type="text" 
                value={bankName} 
                onChange={(e) => setBankName(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
                placeholder="Ex: Société Générale"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>IBAN</label>
              <input 
                type="text" 
                value={bankIban} 
                onChange={(e) => setBankIban(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
                placeholder="FR76 ...."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>BIC / SWIFT</label>
              <input 
                type="text" 
                value={bankBic} 
                onChange={(e) => setBankBic(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
                placeholder="SOGE..."
              />
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Email de notification de virement</label>
              <input 
                type="email" 
                value={bankNotificationEmail} 
                onChange={(e) => setBankNotificationEmail(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }}
                placeholder="Ex: compta@voyyacht.com"
              />
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>Email pour recevoir les preuves de virement.</p>
            </div>
          </>
        )}

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
          {saving ? '⏳ Sauvegarde en cours...' : '💾 Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  );
}
