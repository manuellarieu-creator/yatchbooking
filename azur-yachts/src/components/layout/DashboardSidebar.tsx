'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface DashboardSidebarProps {
  activeSection: string;
  setActiveSection?: (section: any) => void;
  setActiveModal?: (modal: 'profile' | 'publish' | 'verify' | any) => void;
}

export default function DashboardSidebar({ activeSection, setActiveSection, setActiveModal }: DashboardSidebarProps) {
  const [navData, setNavData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user/nav-data')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setNavData(data);
      })
      .catch(console.error);
  }, []);

  const handleNav = (section: string, defaultPath: string) => {
    if (setActiveSection) {
      setActiveSection(section);
    } else {
      window.location.href = defaultPath;
    }
  };

  const handleModal = (modal: 'profile' | 'publish' | 'verify') => {
    if (setActiveModal) {
      setActiveModal(modal);
    } else {
      // If used outside dashboard, we might redirect to dashboard to open the modal
      window.location.href = `/dashboard?modal=${modal}`;
    }
  };

  return (
    <aside className="sidebar desktop-only" style={{ display: 'flex' }}>
      <div className="sidebar-section-label">Navigation</div>
      
      {navData?.user?.role !== 'CLIENT' && (
        <div className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => handleNav('overview', '/dashboard?tab=overview')}>
          <span className="sidebar-icon">📊</span>Vue d'ensemble
        </div>
      )}
      
      {navData?.user?.role !== 'CLIENT' && (
        <div className={`sidebar-item ${activeSection === 'listings' ? 'active' : ''}`} onClick={() => handleNav('listings', '/dashboard?tab=listings')}>
          <span className="sidebar-icon">⚓</span>Mes annonces 
          {navData?.listingsCount > 0 && <span className="sidebar-badge gold">{navData.listingsCount}</span>}
        </div>
      )}

      {navData?.user?.role !== 'CLIENT' && (
        <div className={`sidebar-item ${activeSection === 'bookings' ? 'active' : ''}`} onClick={() => handleNav('bookings', '/dashboard?tab=bookings')}>
          <span className="sidebar-icon">📅</span>Réservations Reçues
        </div>
      )}

      <div className={`sidebar-item ${activeSection === 'reservations' ? 'active' : ''}`} onClick={() => window.location.href='/reservations'}>
        <span className="sidebar-icon">🏖️</span>Mes réservations
      </div>

      {navData?.user?.role !== 'CLIENT' && (
        <div className={`sidebar-item ${activeSection === 'stats' ? 'active' : ''}`} onClick={() => handleNav('stats', '/dashboard?tab=stats')}>
          <span className="sidebar-icon">📈</span>Statistiques
        </div>
      )}
      
      <div className={`sidebar-item ${activeSection === 'messages' ? 'active' : ''}`} onClick={() => handleNav('messages', '/dashboard?tab=messages')}>
        <span className="sidebar-icon">💬</span>Messages
      </div>
      
      {navData?.user?.role !== 'CLIENT' && (
        <div className={`sidebar-item ${activeSection === 'calendar' ? 'active' : ''}`} onClick={() => handleNav('calendar', '/dashboard?tab=calendar')}>
          <span className="sidebar-icon">🗓</span>Calendrier
        </div>
      )}
      
      <div className={`sidebar-item ${activeSection === 'reviews' ? 'active' : ''}`} onClick={() => handleNav('reviews', '/dashboard?tab=reviews')}>
        <span className="sidebar-icon">⭐</span>Avis
      </div>
      
      <div className="sidebar-divider"></div>
      
      <div className="sidebar-section-label">Compte</div>
      <div className="sidebar-item" onClick={() => handleModal('profile')}>
        <span className="sidebar-icon">👤</span>Mon profil
      </div>
      <div className={`sidebar-item ${activeSection === 'favorites' ? 'active' : ''}`} onClick={() => window.location.href='/favorites'}>
        <span className="sidebar-icon">❤️</span>Mes favoris
      </div>

      {navData?.user?.role !== 'CLIENT' && (
        <div className="sidebar-item" onClick={() => handleModal('publish')}>
          <span className="sidebar-icon">➕</span>Nouvelle annonce
        </div>
      )}

      {navData?.user?.role !== 'CLIENT' && (
        <div className="sidebar-item" onClick={() => handleModal('verify')}>
          <span className="sidebar-icon">🎥</span>Vérification vidéo
        </div>
      )}
      
      <div className="sidebar-bottom">
        <div className="sidebar-bottom-item" onClick={() => { signOut({ callbackUrl: '/' }); }}>
          🚪 Se déconnecter
        </div>
      </div>
    </aside>
  );
}
