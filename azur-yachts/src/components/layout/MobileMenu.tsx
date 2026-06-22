'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="mobile-menu-container">
      <button className="hamburger-btn" onClick={toggleMenu} aria-label="Menu">
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
      </button>

      {isOpen && (
        <div className="mobile-overlay" onClick={toggleMenu}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <ul className="mobile-nav-links">
              <li><Link href="/" onClick={toggleMenu}>Accueil</Link></li>
              <li><Link href="/listings" onClick={toggleMenu}>Les Offres</Link></li>
              <li><Link href="/ventes" onClick={toggleMenu}>Ventes</Link></li>
              <li><Link href="/#destinations" onClick={toggleMenu}>Destinations</Link></li>
              <li><Link href="/about" onClick={toggleMenu}>À propos</Link></li>
              <li><Link href="/contact" onClick={toggleMenu}>Contact</Link></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
