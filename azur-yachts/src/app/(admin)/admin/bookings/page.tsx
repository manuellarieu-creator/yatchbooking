import { db as prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { title: true } },
      client: { select: { firstName: true, lastName: true, email: true } },
    }
  });

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Réservations</h1>
        <p className="admin-subtitle">Gérez et suivez toutes les réservations de la plateforme.</p>
      </div>

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
                <tr key={b.id}>
                  <td><strong>{b.id.slice(-6).toUpperCase()}</strong></td>
                  <td>{b.client.firstName} {b.client.lastName}</td>
                  <td>{b.listing.title}</td>
                  <td>{new Date(b.startDate).toLocaleDateString('fr-FR')} - {new Date(b.endDate).toLocaleDateString('fr-FR')}</td>
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
    </div>
  );
}
