'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './home.css';

export default function HomePage() {
  const [featuredYachts, setFeaturedYachts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalYachts: 0,
    destinations: [
      { name: "Côte d'Azur", count: 0, gradient: 'linear-gradient(135deg, #1a5a80, #0a2540)', isLarge: true },
      { name: "Grèce", count: 0, gradient: 'linear-gradient(135deg, #2d6a8a, #0f3a5a)', isLarge: false },
      { name: "Caraïbes", count: 0, gradient: 'linear-gradient(135deg, #1a4a3a, #0a2a20)', isLarge: false },
      { name: "Bali", count: 0, gradient: 'linear-gradient(135deg, #4a2a1a, #2a1a0a)', isLarge: false }
    ]
  });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), 80);
        }
      });
    }, { threshold: 0.08 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch('/api/listings?limit=3')
      .then(res => res.json())
      .then(data => {
        if (data.listings) {
          setFeaturedYachts(data.listings);
        }
      })
      .catch(console.error);

    fetch('/api/home-stats')
      .then(res => res.json())
      .then(data => {
        if (data.destinations) {
          setStats(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="home-container">

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-deco"></div>
        <svg style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', opacity: 0.07, width: '600px', height: 'auto' }} viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 160 L550 160 L480 110 L300 80 L120 110 Z" fill="#b8985a"/>
          <path d="M300 80 L300 20 L200 80 Z" fill="#b8985a"/>
          <path d="M300 80 L300 10 L400 80 Z" fill="#b8985a" opacity="0.6"/>
          <line x1="50" y1="160" x2="550" y2="160" stroke="#b8985a" strokeWidth="2"/>
        </svg>
        <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.15 }} viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
          <path d="M0 40 Q180 10 360 40 Q540 70 720 40 Q900 10 1080 40 Q1260 70 1440 40 L1440 80 L0 80Z" fill="#b8985a"/>
        </svg>

        <div style={{ textAlign: 'center', zIndex: 2, position: 'relative', width: '100%', maxWidth: '1100px', padding: '2rem' }}>
          <div className="hero-content">
            <span className="hero-eyebrow">Yacht Charter de Prestige</span>
            <h1 className="hero-title">Naviguez vers<br/><em>l'Extraordinaire</em></h1>
            <p className="hero-subtitle">Des expériences nautiques d'exception sur les plus belles eaux du monde. Votre yacht, vos règles, votre liberté.</p>
          </div>
          <div className="search-card">
            <div className="search-grid">
              <div className="search-field">
                <label>Destination</label>
                <input type="text" placeholder="Côte d'Azur, Sardaigne…" />
              </div>
              <div className="search-field">
                <label>Départ</label>
                <input type="date" />
              </div>
              <div className="search-field">
                <label>Type de yacht</label>
                <select>
                  <option>Tous types</option>
                  <option>Voilier</option>
                  <option>Catamaran</option>
                  <option>Motor Yacht</option>
                  <option>Superyacht</option>
                </select>
              </div>
              <Link href="/listings" style={{ textDecoration: 'none' }}><button className="search-btn" style={{ width: '100%' }}>Rechercher</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar reveal">
        <div className="stat">
          <div className="stat-num">340<span className="stat-unit">+</span></div>
          <div className="stat-label">Yachts disponibles</div>
        </div>
        <div className="stat">
          <div className="stat-num">68</div>
          <div className="stat-label">Destinations mondiales</div>
        </div>
        <div className="stat">
          <div className="stat-num">12K<span className="stat-unit">+</span></div>
          <div className="stat-label">Clients satisfaits</div>
        </div>
        <div className="stat">
          <div className="stat-num">15</div>
          <div className="stat-label">Années d'excellence</div>
        </div>
      </div>

      {/* DESTINATIONS */}
      <section id="destinations" className="destinations">
        <div className="section-header reveal">
          <span className="section-eyebrow">Explorez le monde</span>
          <h2 className="section-title">Destinations <em>emblématiques</em></h2>
          <p className="section-desc">Des criques cachées de la Méditerranée aux eaux turquoise des Caraïbes, choisissez votre horizon.</p>
        </div>
        <div className="dest-grid reveal">
          {stats.destinations.length > 0 ? stats.destinations.map((dest: any, i: number) => (
            <Link href={`/listings?location=${encodeURIComponent(dest.name)}`} key={dest.id || i} className={`dest-card ${dest.isLarge ? 'large' : ''}`} style={{ textDecoration: 'none' }}>
              <div className="dest-bg" style={{ 
                background: dest.imageUrl ? `url('${dest.imageUrl}') center/cover` : (dest.gradient || 'linear-gradient(135deg, #1a5a80, #0a2540)') 
              }}></div>
              <div className="dest-overlay"></div>
              {dest.isLarge && <span className="dest-tag">Populaire</span>}
              <div className="dest-info">
                <div className="dest-name">{dest.name}</div>
                <div className="dest-count">{dest.count} yachts disponibles</div>
              </div>
            </Link>
          )) : (
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Aucune destination pour le moment.</p>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-header reveal">
          <span className="section-eyebrow" style={{ color: 'var(--gold)' }}>Simple & élégant</span>
          <h2 className="section-title">Comment <em>naviguer</em> avec nous</h2>
          <p className="section-desc" style={{ color: 'rgba(255,255,255,0.45)' }}>Quatre étapes pour vivre l'expérience yacht de vos rêves.</p>
        </div>
        <div className="steps-grid reveal">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-title">Choisissez votre yacht</div>
            <p className="step-desc">Parcourez notre flotte exclusive de 340+ embarcations de prestige, filtrées selon vos critères.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-title">Personnalisez votre croisière</div>
            <p className="step-desc">Sélectionnez vos dates, votre itinéraire, et optez pour des services additionnels (chef, plongée…).</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-title">Confirmez & payez</div>
            <p className="step-desc">Réservation sécurisée en ligne. Acompte de 30%, solde 30 jours avant le départ.</p>
          </div>
          <div className="step">
            <div className="step-num">04</div>
            <div className="step-title">Larguez les amarres</div>
            <p className="step-desc">Notre équipe vous accueille à bord. Votre équipage dédié prend soin de tout.</p>
          </div>
        </div>
      </section>

      {/* YACHTS */}
      <section className="yachts-section">
        <div className="yachts-header reveal">
          <div>
            <span className="section-eyebrow">Notre sélection</span>
            <h2 className="section-title">Yachts <em>d'exception</em></h2>
          </div>
          <Link href="/listings" className="see-more">Voir toute la flotte</Link>
        </div>
        <div className="yachts-grid reveal">
          {featuredYachts.length === 0 ? (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-light)'}}>
              <div className="spinner" style={{margin: '0 auto'}}></div>
            </div>
          ) : (
            featuredYachts.map((yacht: any) => (
              <Link href={`/yacht/${yacht.id}`} key={yacht.id} className="yacht-card">
                <div className="yacht-img">
                  <div className="yacht-img-inner" style={{ 
                    backgroundImage: yacht.images?.[0]?.url ? `url('${yacht.images[0].url}')` : 'linear-gradient(135deg, #1a3a5a 0%, #0a2040 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}></div>
                  {yacht.owner?.advertiserTier === 'PREMIUM' && <span className="yacht-badge" style={{background: 'var(--gold)'}}>Populaire</span>}
                  {yacht.owner?.advertiserTier === 'PLATINIUM' && <span className="yacht-badge" style={{background: 'var(--ocean)'}}>Premium</span>}
                </div>
                <div className="yacht-body">
                  <div className="yacht-type">{yacht.boatType}</div>
                  <div className="yacht-name">{yacht.title}</div>
                  <div className="yacht-specs">
                    <span className="spec"><strong>{yacht.boatLength || '-'}m</strong> longueur</span>
                    <span className="spec"><strong>{yacht.maxAdults}</strong> adultes</span>
                    <span className="spec"><strong>{Math.max(1, Math.floor(yacht.maxAdults/2))}</strong> cabines</span>
                  </div>
                  <div className="yacht-footer">
                    <div className="yacht-price">€{yacht.price.toLocaleString()} <span>/ jour</span></div>
                    <button className="book-btn" onClick={(e) => { e.preventDefault(); window.location.href = `/yacht/${yacht.id}`; }}>Réserver</button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner reveal">
        <div className="cta-banner-content">
          <span className="cta-eyebrow">Votre aventure commence ici</span>
          <h2 className="cta-title">Votre <em>yacht privé</em><br/>vous attend</h2>
          <p className="cta-sub">Laissez-nous concevoir la croisière parfaite. Nos conseillers experts sont à votre disposition pour créer une expérience sur mesure, exactement selon vos désirs.</p>
          <div>
            <Link href="/listings" style={{ textDecoration: 'none' }}><button className="cta-btn">Voir les yachts</button></Link>
            <Link href="/contact" style={{ textDecoration: 'none' }}><button className="cta-btn-outline">Parler à un expert</button></Link>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-header centered reveal">
          <span className="section-eyebrow">Ils nous font confiance</span>
          <h2 className="section-title">Ce que disent<br/>nos <em>navigateurs</em></h2>
        </div>
        <div className="testi-grid reveal">
          <div className="testi-card">
            <span className="testi-quote">"</span>
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">Une semaine en Grèce à bord de l'Azura 68 — un rêve devenu réalité. L'équipage était d'une attention extraordinaire, le yacht immaculé. Nous reviendrons sans aucun doute.</p>
            <div className="testi-author">
              <div className="testi-avatar">SL</div>
              <div>
                <div className="testi-name">Sophie Lemaire</div>
                <div className="testi-loc">Paris, France</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <span className="testi-quote">"</span>
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">Service irréprochable de A à Z. La réservation était simple, le yacht exactement comme sur les photos, et la Côte d'Azur depuis la mer est tout simplement magique.</p>
            <div className="testi-author">
              <div className="testi-avatar">MR</div>
              <div>
                <div className="testi-name">Marco Ricci</div>
                <div className="testi-loc">Milan, Italie</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <span className="testi-quote">"</span>
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">Notre anniversaire de mariage aux Caraïbes. Azur Yachts a tout planifié à la perfection — le catamaran, le chef, les excursions. Une expérience absolument mémorable.</p>
            <div className="testi-author">
              <div className="testi-avatar">AR</div>
              <div>
                <div className="testi-name">Amelia & Robert Chen</div>
                <div className="testi-loc">Londres, Royaume-Uni</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <div className="newsletter reveal">
        <div className="newsletter-text">
          <h3>Offres exclusives & itinéraires secrets</h3>
          <p>Rejoignez 8 000+ passionnés de navigation</p>
        </div>
        <div className="newsletter-form">
          <input className="newsletter-input" type="email" placeholder="Votre adresse e-mail" />
          <button className="newsletter-submit">S'abonner</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">AZUR<span>&nbsp;YACHTS</span></Link>
            <p className="footer-desc">Spécialiste de la location de yachts de luxe depuis 2009. Nous mettons l'excellence au cœur de chaque expérience nautique.</p>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/listings">Notre flotte</Link></li>
              <li><Link href="#">Destinations</Link></li>
              <li><Link href="#">Expériences</Link></li>
              <li><Link href="#">Tarifs & offres</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link href="#">Yacht privé</Link></li>
              <li><Link href="#">Événements</Link></li>
              <li><Link href="#">Chef à bord</Link></li>
              <li><Link href="#">Transferts VIP</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><Link href="#">+33 1 42 00 00 00</Link></li>
              <li><Link href="#">contact@azuryachts.com</Link></li>
              <li><Link href="#">3, Quai des Milliardaires, Monaco</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Azur Yachts. Tous droits réservés.</span>
          <span className="footer-copy">
            <Link href="/legal" style={{ color: 'inherit', textDecoration: 'none' }}>Mentions légales</Link> · 
            <Link href="/legal" style={{ color: 'inherit', textDecoration: 'none' }}> Confidentialité</Link> · 
            <Link href="/legal" style={{ color: 'inherit', textDecoration: 'none' }}> CGV</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
