import { db as prisma } from '@/lib/db';
import AdminBookingsClient from './AdminBookingsClient';

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
      <AdminBookingsClient initialBookings={bookings} />
    </div>
  );
}
