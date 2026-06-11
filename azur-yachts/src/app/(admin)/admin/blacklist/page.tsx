import { db as prisma } from '@/lib/db';
import BlacklistTable from './BlacklistTable';

export const dynamic = 'force-dynamic';

export default async function BlacklistPage() {
  const blacklist = await prisma.blacklist.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <BlacklistTable blacklist={blacklist} />;
}
