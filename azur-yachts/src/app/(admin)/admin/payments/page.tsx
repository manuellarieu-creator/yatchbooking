import { db as prisma } from '@/lib/db';
import AdminPaymentsClient from './AdminPaymentsClient';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        include: {
          client: { select: { firstName: true, lastName: true, email: true } },
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
      <AdminPaymentsClient initialPayments={payments} />
    </div>
  );
}
