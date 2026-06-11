import Link from 'next/link';
import { auth } from '@/auth';
import './header.css';

export default async function Header() {
  const session = await auth();

  return (
    <nav className="nav-top">
      <Link href="/" className="nav-logo">AZUR<span>&nbsp;YACHTS</span></Link>
      
      <ul className="nav-links">
        <li><Link href="/">Accueil</Link></li>
        <li><Link href="/listings">Les Offres</Link></li>
        <li><Link href="#">Destinations</Link></li>
        <li><Link href="/about">À propos</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
      
      <div className="nav-right">
        {session?.user ? (
          <>
            {(session.user as any).role === 'ADMIN' && (
              <Link href="/admin" className="nav-link" style={{marginRight: '1rem', color: '#d4b57a'}}>Espace Admin</Link>
            )}
            <Link href="/reservations" className="nav-link" style={{marginRight: '1rem'}}>Mes réservations</Link>
            <Link href="/profile" className="nav-link" style={{marginRight: '1rem'}}>Mon profil</Link>
            {((session.user as any).role === 'ADVERTISER' || (session.user as any).role === 'ADMIN') && (
              <Link href="/dashboard" className="nav-link" style={{marginRight: '1rem'}}>Tableau de bord</Link>
            )}
            <div className="nav-avatar">
              {((session.user as any).firstName?.[0] || 'U').toUpperCase()}
              {((session.user as any).lastName?.[0] || '').toUpperCase()}
            </div>
          </>
        ) : (
          <>
            <Link href="/auth"><button className="nav-btn nav-btn-outline">Connexion</button></Link>
            <Link href="/publish"><button className="nav-btn nav-btn-gold">Mettre en location</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}
