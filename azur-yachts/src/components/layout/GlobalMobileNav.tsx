'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Settings, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import InAppNotifications from '@/components/layout/InAppNotifications';

export default function GlobalMobileNav() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navData, setNavData] = useState<any>(null);
  
  // Modals inside Global Nav
  const [activeModal, setActiveModal] = useState<'profile' | 'publish' | 'verify' | 'help' | null>(null);
  const { data: session } = useSession();

  // Masquer sur la landing page
  if (pathname === '/') return null;

  useEffect(() => {
    fetch('/api/user/nav-data')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setNavData(data);
      })
      .catch(console.error);
  }, []);

  // Hide on landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <>
      {/* MOBILE SUB-NAV */}
      <div className="mobile-sub-nav">
        <button className="msn-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={20} color="var(--gold, #b8985a)" />
          <span>Menu</span>
        </button>
        <Link href="/" className="msn-btn">
          <Home size={20} color="var(--gold, #b8985a)" />
          <span>Accueil</span>
        </Link>
        <div className="msn-btn msn-notif-wrap">
          <InAppNotifications />
          <span>Notifs</span>
        </div>
        <button className="msn-btn" onClick={() => setActiveModal('profile')}>
          <Settings size={20} color="var(--gold, #b8985a)" />
          <span>Profil</span>
        </button>
      </div>

      {/* OVERLAY FOR SIDEBAR ON MOBILE */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      
      {/* SIDEBAR */}
      <aside className={`sidebar global-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-mobile-header">
          <span className="nav-logo" style={{ color: 'var(--navy)' }}>AZUR<span>&nbsp;YACHTS</span></span>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>
        
        {navData && (
          <>
            <div className="sidebar-section-label">Navigation</div>
            
            {navData.user?.role !== 'CLIENT' && (
              <Link href="/dashboard?tab=overview" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
                <span className="sidebar-icon">📊</span>Vue d'ensemble
              </Link>
            )}
            
            {navData.user?.role !== 'CLIENT' && (
              <Link href="/dashboard?tab=listings" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
                <span className="sidebar-icon">⚓</span>Mes annonces 
                {navData.listingsCount > 0 && <span className="sidebar-badge gold">{navData.listingsCount}</span>}
              </Link>
            )}

            {navData.user?.role !== 'CLIENT' && (
              <Link href="/dashboard?tab=bookings" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
                <span className="sidebar-icon">📅</span>Réservations Reçues
                {navData.pendingBookingsCount > 0 && (
                  <span className="sidebar-badge">{navData.pendingBookingsCount}</span>
                )}
              </Link>
            )}

            <Link href="/reservations" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
              <span className="sidebar-icon">🏖️</span>Mes réservations
            </Link>

            {navData.user?.role !== 'CLIENT' && (
              <Link href="/dashboard?tab=stats" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
                <span className="sidebar-icon">📈</span>Statistiques
              </Link>
            )}
            
            <Link href="/dashboard?tab=messages" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
              <span className="sidebar-icon">💬</span>Messages
            </Link>
            
            {navData.user?.role !== 'CLIENT' && (
              <Link href="/dashboard?tab=calendar" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
                <span className="sidebar-icon">🗓</span>Calendrier
              </Link>
            )}
            
            <Link href="/dashboard?tab=reviews" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
              <span className="sidebar-icon">⭐</span>Avis
            </Link>
            
            <div className="sidebar-divider"></div>
            
            <div className="sidebar-section-label">Compte</div>
            <div className="sidebar-item" onClick={() => { setActiveModal('profile'); setIsSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
              <span className="sidebar-icon">👤</span>Mon profil
            </div>
            <Link href="/favorites" className="sidebar-item" onClick={() => setIsSidebarOpen(false)} style={{ textDecoration: 'none' }}>
              <span className="sidebar-icon">❤️</span>Mes favoris
            </Link>

            {navData.user?.role !== 'CLIENT' && (
              <div className="sidebar-item" onClick={() => { setActiveModal('publish'); setIsSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
                <span className="sidebar-icon">➕</span>Nouvelle annonce
              </div>
            )}

            {navData.user?.role !== 'CLIENT' && (
              <div className="sidebar-item" onClick={() => { setActiveModal('verify'); setIsSidebarOpen(false); }} style={{ cursor: 'pointer' }}>
                <span className="sidebar-icon">🎥</span>Vérification vidéo
                {navData.user?.videoVerified && <span className="sidebar-badge success" style={{ background: 'var(--success, #2e7d32)', color: 'white', marginLeft: 'auto', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>✓ Vérifié</span>}
              </div>
            )}
            
            <div className="sidebar-bottom">
              <div className="sidebar-bottom-item" onClick={() => { signOut({ callbackUrl: '/' }); setIsSidebarOpen(false); }}>
                🚪 Se déconnecter
              </div>
              <div className="sidebar-bottom-item" onClick={() => { setActiveModal('help'); setIsSidebarOpen(false); }}>
                ❓ Aide & support
              </div>
            </div>
          </>
        )}
      </aside>

      {/* MODALS IN GLOBAL NAV */}
      {activeModal === 'profile' && (
        <div className="modal-overlay open" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ width: '95%', maxWidth: '1200px', height: '90vh', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '1rem' }}>
              <h3 className="modal-title">Mon Profil</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <iframe src="/profile?modal=true" style={{ width: '100%', height: 'calc(100% - 70px)', border: 'none' }} />
          </div>
        </div>
      )}

      {activeModal === 'publish' && (
        <div className="modal-overlay open" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ width: '95%', maxWidth: '1200px', height: '90vh', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '1rem' }}>
              <h3 className="modal-title">Nouvelle Annonce</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <iframe src="/publish?modal=true" style={{ width: '100%', height: 'calc(100% - 70px)', border: 'none' }} />
          </div>
        </div>
      )}

      {activeModal === 'verify' && (
        <div className="modal-overlay open" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ width: '95%', maxWidth: '800px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Vérification de profil</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
              <h4 style={{ fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1rem' }}>Vérification vidéo requise</h4>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Pour garantir la sécurité de la plateforme, nous vous demandons de filmer une courte vidéo de vous tenant votre pièce d'identité.</p>
              <button className="btn btn-gold" onClick={() => setActiveModal(null)}>Commencer la vérification</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'help' && (
        <div className="modal-overlay open" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ width: '95%', maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Aide & Support</h3>
              <button className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--navy)', marginBottom: '1rem' }}>Comment pouvons-nous vous aider ?</h4>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Notre équipe est disponible du lundi au samedi, de 9h à 19h.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="mailto:support@azuryachts.com" className="btn btn-outline" style={{ justifyContent: 'center' }}>✉️ Envoyer un email</a>
                <button className="btn btn-primary" onClick={() => setActiveModal(null)}>💬 Démarrer un chat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
