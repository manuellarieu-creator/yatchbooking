import { db as prisma } from '@/lib/db';
import UsersTable from './UsersTable';

export default async function UsersAdminPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <UsersTable users={users} />;
}
