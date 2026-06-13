'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminBookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const REJECT_REASONS = [
    'Le montant reçu ne correspond pas au montant de la réservation.',
    'La référence de virement est manquante ou incorrecte.',
    'Le délai de réception du virement a été dépassé.',
    'Autre'
  ];

  const handleRowClick = (booking: any) => {
    setSelectedBooking(booking);
    setModalOpen(true);
    setRejectReason(REJECT_REASONS[0]);
  };

  const handleValidate = async (status: string, paymentStatus: string) => {
    if (!selectedBooking) return;
    
    // Si on rejette, on vérifie la raison
    let finalReason = rejectReason;
    if (status === 'REJECTED' && finalReason === 'Autre') {
      const customReason = prompt('Veuillez saisir la raison du rejet :');
      if (!customReason) return;
      finalReason = customReason;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus, reason: finalReason })
      });
      const data = await res.json();
      if (data.success) {
        alert('Statut mis à jour et email envoyé au client.');
        // Update local state
        setBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, status } : b));
        setModalOpen(false);
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (e) {
      alert('Erreur réseau');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="admin-table-card">
        {bookings.length === 0 ? (
          <div className="empty-state">Aucune réservation trouvée.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Client</th>
                <th>Annonce</th>
                <th>Dates</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} onClick={() => handleRowClick(b)} style={{ cursor: 'pointer' }}>
                  <td><strong>{b.id.slice(-6).toUpperCase()}</strong></td>
                  <td>{b.client.firstName} {b.client.lastName}</td>
                  <td>{b.listing.title}</td>
                  <td>{format(new Date(b.startDate), 'dd MMM yyyy', { locale: fr })} - {format(new Date(b.endDate), 'dd MMM yyyy', { locale: fr })}</td>
                  <td>€{b.totalPrice.toLocaleString('fr-FR')}</td>
                  <td>
                    <span className={`status-badge status-${b.status.toLowerCase()}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Détails de la réservation {selectedBooking.id.slice(-6).toUpperCase()}</h2>
            <hr style={{ margin: '1rem 0' }} />
            
            <p><strong>Client :</strong> {selectedBooking.client.firstName} {selectedBooking.client.lastName} ({selectedBooking.client.email})</p>
            <p><strong>Bateau :</strong> {selectedBooking.listing.title}</p>
            <p><strong>Dates :</strong> {format(new Date(selectedBooking.startDate), 'dd MMM yyyy', { locale: fr })} au {format(new Date(selectedBooking.endDate), 'dd MMM yyyy', { locale: fr })}</p>
            <p><strong>Montant Total :</strong> €{selectedBooking.totalPrice.toLocaleString('fr-FR')}</p>
            <p><strong>Statut actuel :</strong> <span className={`status-badge status-${selectedBooking.status.toLowerCase()}`}>{selectedBooking.status}</span></p>

            <div style={{ background: '#f5f5f5', padding: '1rem', marginTop: '1rem', borderRadius: '4px' }}>
              <h3>Actions de validation (Paiement par Virement)</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                Si cette réservation a été payée par virement, vous pouvez valider ou rejeter la réception des fonds ici.
                Une notification email sera automatiquement envoyée au client.
              </p>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button 
                  onClick={() => handleValidate('CONFIRMED', 'VERIFIED')}
                  disabled={loading || selectedBooking.status === 'CONFIRMED'}
                  style={{ background: '#2e7d32', color: 'white', padding: '0.8rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
                >
                  ✅ Virement Reçu | Réservation Validée
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Raison du rejet (si applicable) :</label>
                <select 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  {REJECT_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                
                <button 
                  onClick={() => handleValidate('REJECTED', 'FAILED')}
                  disabled={loading || selectedBooking.status === 'REJECTED'}
                  style={{ background: '#d32f2f', color: 'white', padding: '0.8rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ❌ Virement Non Reçu | Réservation Rejetée
                </button>
              </div>
            </div>

            <button onClick={() => setModalOpen(false)} style={{ marginTop: '2rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}
