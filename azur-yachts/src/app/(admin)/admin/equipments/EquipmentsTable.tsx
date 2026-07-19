'use client';

import { useState, useEffect } from 'react';
import { DynamicIcon, AVAILABLE_ICONS } from '@/components/ui/DynamicIcon';

type Equipment = {
  id: string;
  name: string;
  category: string;
  iconName: string;
};

export default function EquipmentsTable() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('A_BORD');
  const [newIconName, setNewIconName] = useState(AVAILABLE_ICONS[0]);

  const CATEGORIES = [
    { value: 'A_BORD', label: 'Confort à bord' },
    { value: 'EXTERIEUR', label: 'Équipements Extérieurs' },
    { value: 'LOISIR', label: 'Loisirs & Sports' },
    { value: 'OPTIONNEL', label: 'Équipements Optionnels' }
  ];

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const res = await fetch('/api/equipments');
      const data = await res.json();
      setEquipments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/equipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, category: newCategory, iconName: newIconName })
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewName('');
        fetchEquipments();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de l\'ajout');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet équipement ?')) return;
    try {
      const res = await fetch(`/api/admin/equipments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEquipments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Gestion des Équipements</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Annuler' : '+ Ajouter un équipement'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>Nouvel Équipement</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="field">
              <label className="label">Nom de l'équipement</label>
              <input 
                className="input" 
                required 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                placeholder="Ex: Machine à glaçons" 
              />
            </div>
            <div className="field">
              <label className="label">Catégorie</label>
              <select className="select" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label className="label">Choix de l'icône : <DynamicIcon name={newIconName} className="inline w-5 h-5 ml-2" /></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
              {AVAILABLE_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  title={icon}
                  onClick={() => setNewIconName(icon)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: newIconName === icon ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: newIconName === icon ? 'rgba(0, 150, 255, 0.1)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <DynamicIcon name={icon} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Enregistrer l'équipement</button>
        </form>
      )}

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Icône</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Nom</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Catégorie</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipments.map(eq => (
              <tr key={eq.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}><DynamicIcon name={eq.iconName} className="w-5 h-5 text-gray-400" /></td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{eq.name}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                    {CATEGORIES.find(c => c.value === eq.category)?.label || eq.category}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(eq.id)} style={{ color: '#ff4d4f', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {equipments.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'gray' }}>Aucun équipement trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
