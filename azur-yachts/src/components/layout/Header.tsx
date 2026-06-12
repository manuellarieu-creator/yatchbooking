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
      
      <ul className="nav-links">
        <li><Link href="/">Accueil</Link></li>
        <li><Link href="/listings">Les Offres</Link></li>
        <li><Link href="/#destinations">Destinations</Link></li>
        <li><Link href="/about">À propos</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
      
      <div className="nav-right">
        {session?.user ? (
          <>
            {/* The dropdown handles the user links now */}
            <UserMenu user={session.user} />
          </>
        ) : (
          <>
            <Link href="/auth" className="desktop-only"><button className="nav-btn nav-btn-outline">Connexion</button></Link>
            <Link href="/publish" className="desktop-only"><button className="nav-btn nav-btn-gold">Mettre en location</button></Link>
          </>
        )}
        <MobileMenu hasUser={!!session?.user} />
      </div>
    </nav>
  );
}
