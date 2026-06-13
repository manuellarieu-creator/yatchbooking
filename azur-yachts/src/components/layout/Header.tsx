import Link from 'next/link';
import { auth } from '@/auth';
import './header.css';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import InAppNotifications from '@/components/layout/InAppNotifications';

export default async function Header() {
  const session = await auth();

  // DASHBOARD-STYLE HEADER FOR LOGGED IN USERS
  if (session?.user) {
    return (
      <nav className="nav-top" style={{ padding: '0 2.5rem', zIndex: 1050, borderBottom: 'none' }}>
        <div className="nav-left desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" className="nav-logo" style={{ marginRight: '1rem' }}>AZUR<span>&nbsp;YACHTS</span></Link>
          <Link href="/" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>ACCUEIL</Link>
          <Link href="/listings" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>LES OFFRES</Link>
          <Link href="/reservations" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>RÉSERVATIONS</Link>
          <Link href="/dashboard?tab=messages" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>MESSAGES</Link>
          <Link href="/favorites" className="nav-tab" style={{ color: '#fff', textDecoration: 'none', fontSize: '.8rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>FAVORIS</Link>
        </div>
        
        {/* On mobile, keep the right side clear so GlobalMobileNav can handle it */}
        <div className="mobile-only-nav" style={{ flex: 1 }}></div>

        <div className="nav-right desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <InAppNotifications />
          <UserMenu user={session.user} />
        </div>
      </nav>
    );
  }

  // DEFAULT WHITE HEADER FOR GUESTS
  return (
    <nav className="nav-top">
      <Link href="/" className="nav-logo">AZUR<span>&nbsp;YACHTS</span></Link>
      
      {/* Desktop: liens de navigation classiques */}
      <ul className="nav-links">
        <li><Link href="/">Accueil</Link></li>
        <li><Link href="/listings">Les Offres</Link></li>
        <li><Link href="/#destinations">Destinations</Link></li>
        <li><Link href="/about">À propos</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
      
      <div className="nav-right">
        {/* Desktop uniquement: boutons Connexion / Mettre en location */}
        <Link href="/auth" className="desktop-only"><button className="nav-btn nav-btn-outline">Connexion</button></Link>
        <Link href="/publish" className="desktop-only"><button className="nav-btn nav-btn-gold">Mettre en location</button></Link>

        <UserMenu user={null} guestClass="guest-user-menu" />

        {/* Mobile uniquement: hamburger menu */}
        <MobileMenu />
      </div>
    </nav>
  );
}

