import { db as prisma } from '@/lib/db';
import ListingsTable from './ListingsTable';

export default async function ListingsAdminPage() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: true,
      services: true,
      owner: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    }
  });

  return <ListingsTable listings={listings as any} />;
}
