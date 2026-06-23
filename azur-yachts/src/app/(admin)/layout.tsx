import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import InAppNotifications from '@/components/layout/InAppNotifications';
import './admin.css';
import AdminSidebar from './AdminSidebar';
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
