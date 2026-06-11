'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function UserMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const initials = `${(user.firstName?.[0] || 'U').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`;

  return (
    <div className="user-menu-container" ref={menuRef}>
      <div className="nav-avatar" onClick={() => setIsOpen(!isOpen)}>
        {initials}
      </div>

      {isOpen && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <strong>{user.firstName} {user.lastName}</strong>
            <span>{user.email}</span>
          </div>
          <div className="user-dropdown-body">
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="dropdown-item" onClick={() => setIsOpen(false)}>Espace Admin</Link>
            )}
            {(user.role === 'ADVERTISER' || user.role === 'ADMIN') && (
              <Link href="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>Tableau de bord</Link>
            )}
            <Link href="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>Mon profil</Link>
            <Link href="/reservations" className="dropdown-item" onClick={() => setIsOpen(false)}>Mes réservations</Link>
            <Link href="/favorites" className="dropdown-item" onClick={() => setIsOpen(false)}>Mes favoris</Link>
            <div className="dropdown-divider"></div>
            <button onClick={handleLogout} className="dropdown-item text-danger">Déconnexion</button>
          </div>
        </div>
      )}
    </div>
  );
}
