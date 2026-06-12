'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function UserMenu({ user }: { user?: any }) {
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

  const initials = user ? `${(user.firstName?.[0] || 'U').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}` : '👤';

  return (
    <div className="user-menu-container" ref={menuRef}>
      <div className="user-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        {user && <span className="user-menu-name">{user.firstName} {user.lastName}</span>}
        <div className="nav-avatar" style={!user ? { background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)' } : {}}>
          {initials}
        </div>
        <span className="user-menu-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="user-dropdown">
          {user ? (
            <>
              <div className="user-dropdown-header">
                <strong>{user.firstName} {user.lastName}</strong>
              </div>
              <div className="user-dropdown-body">
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="dropdown-item" onClick={() => setIsOpen(false)}>Espace Admin</Link>
                )}
                <Link href="/dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>Tableau de bord</Link>
                <Link href="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>Mon profil</Link>
                <Link href="/reservations" className="dropdown-item" onClick={() => setIsOpen(false)}>Mes réservations</Link>
                <Link href="/favorites" className="dropdown-item" onClick={() => setIsOpen(false)}>Mes favoris</Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item text-danger">Déconnexion</button>
              </div>
            </>
          ) : (
            <>
              <div className="user-dropdown-header">
                <strong>Mon Compte</strong>
              </div>
              <div className="user-dropdown-body">
                <Link href="/auth?tab=login" className="dropdown-item" onClick={() => setIsOpen(false)}>Connexion</Link>
                <Link href="/auth?tab=register" className="dropdown-item" onClick={() => setIsOpen(false)}>Inscription</Link>
                <div className="dropdown-divider"></div>
                <Link href="/publish" className="dropdown-item" onClick={() => setIsOpen(false)}>Mettre en location</Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
