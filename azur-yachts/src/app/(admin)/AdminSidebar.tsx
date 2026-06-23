'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import InAppNotifications from '@/components/layout/InAppNotifications';
import { Menu, X } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <>
      <button className="admin-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
        {!isOpen && <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>MENU ADMIN</span>}
      </button>

      {isOpen && <div className="admin-sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <Link href="/" onClick={() => setIsOpen(false)}>AZUR<span>YACHTS</span></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="admin-badge">Admin</div>
            <InAppNotifications />
          </div>
        </div>
        <nav className="admin-nav">
          <Link href="/admin/users" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/users') ? 'active' : ''}`}>👥 Annonceurs & Utilisateurs</Link>
          <Link href="/admin/listings" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/listings') ? 'active' : ''}`}>🛥️ Annonces Yachts</Link>
          <Link href="/admin/destinations" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/destinations') ? 'active' : ''}`}>🌍 Destinations</Link>
          <Link href="/admin/bookings" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/bookings') ? 'active' : ''}`}>📅 Réservations</Link>
          <Link href="/admin/payments" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/payments') ? 'active' : ''}`}>💶 Paiements</Link>
          <Link href="/admin/messages" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/messages') ? 'active' : ''}`}>💬 Messagerie</Link>
          <Link href="/admin/reviews" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/reviews') ? 'active' : ''}`}>⭐ Avis & Modération</Link>
          <Link href="/admin/blacklist" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/blacklist') ? 'active' : ''}`}>⛔ Blacklist</Link>
          <Link href="/admin/newsletter" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/newsletter') ? 'active' : ''}`}>📧 Newsletter</Link>
          <Link href="/admin/pages/about" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/pages/about') ? 'active' : ''}`}>📄 Page À propos</Link>
          <Link href="/admin/settings/general" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/settings/general') ? 'active' : ''}`}>⚙️ Paramètres</Link>
          <Link href="/admin/settings/payments" onClick={() => setIsOpen(false)} className={`admin-nav-link ${isActive('/admin/settings/payments') ? 'active' : ''}`}>🏦 Paramètres Banque</Link>
        </nav>
        <div className="admin-logout">
          <Link href="/" className="admin-nav-link">← Retour au site</Link>
        </div>
      </aside>
    </>
  );
}
