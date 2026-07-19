import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import EquipmentsTable from './EquipmentsTable';

export const metadata = {
  title: 'Gestion des Équipements | Admin VoyYacht',
};

export default async function AdminEquipmentsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="admin-page">
      <EquipmentsTable />
    </div>
  );
}
