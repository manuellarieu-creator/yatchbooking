import { db as prisma } from '@/lib/db';
import DestinationsTable from './DestinationsTable';

export default async function DestinationsAdminPage() {
  const destinations = await prisma.destination.findMany({
    orderBy: { order: 'asc' }
  });

  return <DestinationsTable destinations={destinations} />;
}
