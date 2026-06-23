import Link from 'next/link';
import { auth } from '@/auth';
import './header.css';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import InAppNotifications from '@/components/layout/InAppNotifications';

export default async function Header() {
  const session = await auth();

  return (
    <>
      {/* ─── DESKTOP HEADER FOR LOGGED IN USERS ─── */}
      {session?.user && (
        <nav className="nav-top desktop-only" style={{ zIndex: 1050, borderBottom: 'none' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: '1rem' }}>VOY<span>YACHT</span></Link>
          
          <div className="nav-center" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>ACCUEIL</Link>
            <Link href="/listings" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>LES OFFRES</Link>
            <Link href="/ventes" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>VENTES</Link>
            <Link href="/reservations" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>RÉSERVATIONS</Link>
            <Link href="/dashboard?tab=messages" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>MESSAGES</Link>
            <Link href="/favorites" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>FAVORIS</Link>
          </div>

          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <InAppNotifications />
            <UserMenu user={session.user} />
          </div>
        </nav>
      )}

      {/* ─── STANDARD HEADER (GUESTS EVERYWHERE + LOGGED IN MOBILE) ─── */}
      <nav className={`nav-top ${session?.user ? 'mobile-only' : ''}`}>
        <Link href="/" className="nav-logo">VOY<span>YACHT</span></Link>
        
        {/* Desktop: liens de navigation classiques */}
        <ul className="nav-links">
          <li><Link href="/">Accueil</Link></li>
          <li><Link href="/listings">Les Offres</Link></li>
          <li><Link href="/ventes">Ventes</Link></li>
          <li><Link href="/destinations">Destinations</Link></li>
          <li><Link href="/about">À propos</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        
        <div className="nav-right">
          {/* Desktop uniquement: boutons Connexion / Mettre en location */}
          {!session?.user && (
            <>
              <Link href="/auth" className="desktop-only"><button className="nav-btn nav-btn-outline">Connexion</button></Link>
              <Link href="/publish" className="desktop-only"><button className="nav-btn nav-btn-gold">Mettre en location</button></Link>
            </>
          )}

          {/* Icône utilisateur — sur desktop uniquement si connecté, toujours sur mobile */}
          <UserMenu user={session?.user || null} guestClass={!session?.user ? 'guest-user-menu' : ''} />

          {/* Mobile uniquement: hamburger menu */}
          <MobileMenu />
        </div>
      </nav>
    </>
  );
}

