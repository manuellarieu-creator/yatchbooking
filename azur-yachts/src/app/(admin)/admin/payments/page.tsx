import { db as prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        include: {
          client: { select: { firstName: true, lastName: true } },
          listing: { select: { title: true } }
        }
      }
    }
  });

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Paiements</h1>
        <p className="admin-subtitle">Historique des paiements et transactions.</p>
      </div>

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
                <tr key={p.id}>
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
    </div>
  );
}
