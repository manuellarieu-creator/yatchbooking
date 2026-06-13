'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminPaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [payments, setPayments] = useState(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRowClick = (payment: any) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const handleValidate = async (status: string, bookingStatus: string) => {
    if (!selectedPayment) return;
    setLoading(true);
    try {
      // On utilise la même route que pour les réservations, puisque ça met à jour les deux
      const res = await fetch(`/api/admin/bookings/${selectedPayment.bookingId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: bookingStatus, paymentStatus: status })
      });
      const data = await res.json();
      if (data.success) {
        alert('Statut du paiement et de la réservation mis à jour.');
        setPayments(payments.map(p => p.id === selectedPayment.id ? { ...p, status } : p));
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
        {payments.length === 0 ? (
          <div className="empty-state">Aucun paiement trouvé.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID Transaction</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Statut</th>
                <th>Client</th>
                <th>Annonce</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} onClick={() => handleRowClick(p)} style={{ cursor: 'pointer' }}>
                  <td><strong>{p.id.slice(-6).toUpperCase()}</strong></td>
                  <td>€{p.amount.toLocaleString('fr-FR')}</td>
                  <td>{p.method}</td>
                  <td>
                    <span className={`status-badge status-${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.booking.client.firstName} {p.booking.client.lastName}</td>
                  <td>{p.booking.listing.title}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px' }}>
            <h2>Détails du Paiement {selectedPayment.id.slice(-6).toUpperCase()}</h2>
            <hr style={{ margin: '1rem 0' }} />
            
            <p><strong>Montant :</strong> €{selectedPayment.amount.toLocaleString('fr-FR')}</p>
            <p><strong>Méthode :</strong> {selectedPayment.method}</p>
            <p><strong>Statut actuel :</strong> <span className={`status-badge status-${selectedPayment.status.toLowerCase()}`}>{selectedPayment.status}</span></p>
            
            {selectedPayment.method === 'BANK_TRANSFER' && selectedPayment.bankProofUrl && (
              <p style={{ marginTop: '1rem' }}>
                <strong>Preuve de virement soumise :</strong><br/>
                <a href={selectedPayment.bankProofUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ocean)', textDecoration: 'underline' }}>
                  Voir le justificatif
                </a>
              </p>
            )}

            <div style={{ background: '#f0f9ff', padding: '1rem', marginTop: '1rem', borderRadius: '4px' }}>
              <h3>Actions</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                Ici, vous pouvez rapidement valider la réception du paiement.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleValidate('VERIFIED', 'CONFIRMED')}
                  disabled={loading || selectedPayment.status === 'VERIFIED'}
                  style={{ background: '#2e7d32', color: 'white', padding: '0.8rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
                >
                  ✅ Marquer comme Paiement Reçu
                </button>
                <button 
                  onClick={() => handleValidate('FAILED', 'REJECTED')}
                  disabled={loading || selectedPayment.status === 'FAILED'}
                  style={{ background: '#d32f2f', color: 'white', padding: '0.8rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}
                >
                  ❌ Marquer comme Non Reçu
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
