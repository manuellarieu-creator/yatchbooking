import Link from 'next/link';
import { auth } from '@/auth';
import './header.css';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';

export default async function Header() {
  const session = await auth();

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
  );
}

