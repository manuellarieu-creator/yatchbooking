import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Link from 'next/link';
import './admin.css';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/">AZUR<span>YACHTS</span></Link>
          <div className="admin-badge">Admin</div>
        </div>
        <nav className="admin-nav">
          <Link href="/admin/users" className="admin-nav-link">👥 Annonceurs & Utilisateurs</Link>
          <Link href="/admin/listings" className="admin-nav-link">🛥️ Annonces Yachts</Link>
          <Link href="/admin/destinations" className="admin-nav-link">🌍 Destinations</Link>
          <Link href="/admin/bookings" className="admin-nav-link">📅 Réservations</Link>
          <Link href="/admin/payments" className="admin-nav-link">💶 Paiements</Link>
          <Link href="/admin/messages" className="admin-nav-link">💬 Messagerie</Link>
          <Link href="/admin/reviews" className="admin-nav-link">⭐ Avis & Modération</Link>
          <Link href="/admin/blacklist" className="admin-nav-link">⛔ Blacklist</Link>
        </nav>
        <div className="admin-logout">
          <Link href="/" className="admin-nav-link">← Retour au site</Link>
        </div>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
