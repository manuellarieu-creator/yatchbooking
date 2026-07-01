'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import './home.css';

export default function HomePage() {
  const router = useRouter();
  const [featuredYachts, setFeaturedYachts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalYachts: null,
    destinations: [],
    totalDestinationsCount: null,
    settings: null,
    reviews: []
  });

  // Auto-scroll for mobile sliders
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth <= 768) {
        const sliders = document.querySelectorAll('.infinite-scroll-wrapper');
        sliders.forEach(slider => {
          if (slider.matches(':active') || slider.matches(':hover')) return;
          const maxScroll = slider.scrollWidth - slider.clientWidth;
          if (maxScroll > 0) {
            let nextScroll = slider.scrollLeft + slider.clientWidth * 0.8;
            if (slider.scrollLeft >= maxScroll - 10) {
              nextScroll = 0; // go back to start
            } else if (nextScroll > maxScroll) {
              nextScroll = maxScroll; // go to the very end
            }
            slider.scrollTo({ left: nextScroll, behavior: 'smooth' });
          }
        });
      }
    }, 4500);
    return () => clearInterval(interval);
  }, []);
  const [loadingStats, setLoadingStats] = useState(true);
  const [email, setEmail] = useState('');
  const [newsStatus, setNewsStatus] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleNewsletter = async () => {
    if (!email) return;
    setNewsStatus('saving');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) setNewsStatus('success');
      else setNewsStatus('error');
    } catch {
      setNewsStatus('error');
    }
  };

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
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));
  }, []);

  return (
    <main className="home-container">

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

        <div className="hero-wrapper" style={{ textAlign: 'center', zIndex: 2, position: 'relative', width: '100%', maxWidth: '1100px' }}>
          <div className="hero-content">
            <span className="hero-eyebrow">Yacht Charter de Prestige</span>
            <h1 className="hero-title">Naviguez vers<br/><em>l'Extraordinaire</em></h1>
            <p className="hero-subtitle">Des expériences nautiques d'exception sur les plus belles eaux du monde. Votre yacht, vos règles, votre liberté.</p>
          </div>
          <div className="search-card">
            <div className="search-grid">
              <div className="search-field">
                <label>Destination</label>
                <input 
                  type="text" 
                  placeholder="Côte d'Azur, Sardaigne…" 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <div className="search-field">
                <label>Départ</label>
                <input type="date" />
              </div>
              <div className="search-field">
                <label>Type de yacht</label>
                <select>
                  <option>Tous types</option>
                  <option value="Voilier">⛵ Voilier</option>
                  <option value="Catamaran">🚤 Catamaran</option>
                  <option value="Motor Yacht">🛥️ Motor Yacht</option>
                  <option value="Superyacht">🚢 Superyacht</option>
                  <option value="Cabine Cruiser">🛥️ Cabine Cruiser</option>
                </select>
              </div>
              <Link href={`/listings${searchLocation ? `?location=${encodeURIComponent(searchLocation)}` : ''}`} style={{ textDecoration: 'none' }}>
                <button className="search-btn" style={{ width: '100%', fontSize: '0.95rem' }}>Voir les yachts disponibles</button>
              </Link>
            </div>
            
            {/* TAGS POPULAIRES ET URGENCE */}
            <div className="search-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {[
                  { id: 'Côte d\'Azur', title: 'Côte d’Azur', sub: 'top conversion' },
                  { id: 'Ibiza', title: 'Ibiza', sub: 'summer hotspots' },
                  { id: 'Mykonos', title: 'Mykonos', sub: 'luxury party yachts' },
                  { id: 'Monaco', title: 'Monaco', sub: 'ultra luxe' }
                ].map(tag => (
                  <button 
                    key={tag.id} 
                    onClick={() => {
                      setSearchLocation(tag.id);
                      router.push(`/listings?location=${encodeURIComponent(tag.id)}`);
                    }}
                    style={{ background: 'rgba(10, 22, 40, 0.05)', border: '1px solid rgba(10, 22, 40, 0.1)', color: 'var(--navy)', padding: '0.4rem 1rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'var(--gold)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = 'var(--gold)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(10, 22, 40, 0.05)';
                      e.currentTarget.style.color = 'var(--navy)';
                      e.currentTarget.style.borderColor = 'rgba(10, 22, 40, 0.1)';
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>🔥 {tag.title}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tag.sub}</div>
                  </button>
                ))}
              </div>
              <p style={{ color: 'var(--gold)', fontSize: '0.85rem', margin: 0, fontWeight: 500, letterSpacing: '0.03em' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%', marginRight: '6px', animation: 'pulse 2s infinite' }}></span>
                Disponibilité limitée cette semaine en Méditerranée
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* YACHTS (Remonté selon l'audit) */}
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
                  {yacht.isAtSea ? (
                    <span className="yacht-badge" style={{background: 'rgba(230, 150, 0, 0.95)', color: '#fff'}}>⚓ En mer</span>
                  ) : (
                    <>
                      {yacht.owner?.advertiserTier === 'PREMIUM' && <span className="yacht-badge" style={{background: 'var(--gold)'}}>Populaire</span>}
                      {yacht.owner?.advertiserTier === 'PLATINIUM' && <span className="yacht-badge" style={{background: 'var(--ocean)'}}>Premium</span>}
                    </>
                  )}
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
                    <div className="yacht-price">{formatPrice(yacht.price)} <span>/ jour</span></div>
                    <button className="book-btn" onClick={(e) => { e.preventDefault(); window.location.href = `/yacht/${yacht.id}`; }}>Réserver</button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* STATS BAR */}
      <div className="infinite-scroll-wrapper stats-bar-wrapper" style={{ background: 'var(--navy-mid)', padding: '2rem 0' }}>
        <div className="infinite-scroll-track">
          {[1, 2].map((group) => (
            <div key={group} className="infinite-scroll-group" style={{ display: 'flex', gap: '2rem', paddingRight: '2rem' }}>
              <div className="stat">
                <div className="stat-num">{stats.totalYachts !== null ? stats.totalYachts : '-'}</div>
                <div className="stat-label">Yachts disponibles</div>
              </div>
              <div className="stat">
                <div className="stat-num">{stats.totalDestinationsCount !== null ? stats.totalDestinationsCount : '-'}</div>
                <div className="stat-label">Destinations mondiales</div>
              </div>
              <div className="stat">
                <div className="stat-num">{stats.settings?.satisfiedClients || '-'}</div>
                <div className="stat-label">Clients satisfaits</div>
              </div>
              <div className="stat">
                <div className="stat-num">{stats.settings?.yearsOfExcellence || '-'}</div>
                <div className="stat-label">Années d'excellence</div>
              </div>
            </div>
          ))}
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
          {loadingStats ? (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-light)'}}>
              <div className="spinner" style={{margin: '0 auto'}}></div>
            </div>
          ) : stats.destinations.length > 0 ? (
            <>
              {stats.destinations.slice(0, 4).map((dest: any, i: number) => {
                let mosaicClass = `dest-pos-${i + 1}`;
                
                return (
                  <Link href={`/listings?location=${encodeURIComponent(dest.name)}`} key={dest.id || i} className={`dest-card ${mosaicClass}`} style={{ textDecoration: 'none' }}>
                    <div className="dest-bg" style={{ 
                      background: dest.imageUrl ? `url('${dest.imageUrl}') center/cover` : (dest.gradient || 'linear-gradient(135deg, #1a5a80, #0a2540)') 
                    }}></div>
                    <div className="dest-overlay"></div>
                    {dest.isLarge && <span className="dest-tag">Populaire</span>}
                    <div className="dest-info">
                      <div className="dest-name">{dest.name}</div>
                      <div className="dest-count">{dest.count} yacht{dest.count > 1 ? 's' : ''} disponible{dest.count > 1 ? 's' : ''}</div>
                      {dest.minPrice && (
                        <div className="dest-price" style={{ fontSize: '0.9rem', color: 'var(--gold)', marginTop: '0.3rem', fontWeight: 500 }}>
                          à partir de {formatPrice(dest.minPrice)} / jour
                        </div>
                      )}
                      <div className="dest-action" style={{ marginTop: '1rem' }}>
                        <button className="dest-btn" style={{ background: 'var(--gold)', color: '#111', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Explorer</button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Aucune destination pour le moment.</p>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link href="/destinations" className="search-btn" style={{ textDecoration: 'none', display: 'inline-block', fontSize: '0.85rem' }}>
            Voir toutes les destinations
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="section-header reveal">
          <span className="section-eyebrow" style={{ color: 'var(--gold)' }}>Simple & élégant</span>
          <h2 className="section-title">Comment <em>naviguer</em> avec nous</h2>
          <p className="section-desc" style={{ color: 'rgba(255,255,255,0.45)' }}>Quatre étapes pour vivre l'expérience yacht de vos rêves.</p>
        </div>
        <div className="infinite-scroll-wrapper steps-wrapper" style={{ marginTop: '3rem' }}>
          <div className="infinite-scroll-track" style={{ animationDuration: '25s' }}>
            {[1, 2].map((group) => (
              <div key={group} className="infinite-scroll-group" style={{ display: 'flex', gap: '2rem', paddingRight: '2rem' }}>
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
            ))}
          </div>
        </div>
      </section>

      {/* YACHTS SECTION MOVED UP */}

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
        <div className="infinite-scroll-wrapper testi-wrapper" style={{ marginTop: '3rem' }}>
          <div className="infinite-scroll-track">
            {loadingStats ? (
              <div style={{width: '100%', textAlign: 'center', padding: '3rem', color: 'var(--text-light)'}}>
                <div className="spinner" style={{margin: '0 auto'}}></div>
              </div>
            ) : stats?.reviews?.length > 0 ? (
              [1, 2].map((group) => (
                <div key={group} className="infinite-scroll-group" style={{ display: 'flex', gap: '2rem', paddingRight: '2rem' }}>
                  {stats.reviews.map((review: any, i: number) => (
                    <div className="testi-card" key={`group${group}-review${review.id || i}`}>
                      <span className="testi-quote">"</span>
                      <div className="testi-stars">{'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}</div>
                      <p className="testi-text">{review.comment}</p>
                      <div className="testi-author">
                        <div className="testi-avatar">
                          {review.author?.avatar ? (
                            <img src={review.author.avatar} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                          ) : (
                            (review.author?.firstName?.[0] || '') + (review.author?.lastName?.[0] || '')
                          )}
                        </div>
                        <div>
                          <div className="testi-name">{review.author?.firstName} {review.author?.lastName}</div>
                          <div className="testi-loc">{review.author?.countryResidence || 'Client VoyYacht'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{width: '100%', textAlign: 'center', padding: '3rem', color: '#666'}}>
                 Aucun avis client approuvé pour le moment.
              </div>
            )}
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
          {newsStatus === 'success' ? (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
              Merci pour votre inscription !
            </div>
          ) : (
            <>
              <input 
                className="newsletter-input" 
                type="email" 
                placeholder="Votre adresse e-mail" 
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button 
                className="newsletter-submit" 
                onClick={handleNewsletter}
                disabled={newsStatus === 'saving' || !email}
              >
                {newsStatus === 'saving' ? '...' : "S'abonner"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">VOY<span>YACHT</span></Link>
            <p className="footer-desc">Spécialiste de la location de yachts de luxe depuis 2022. Nous mettons l'excellence au cœur de chaque expérience nautique.</p>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/listings">Notre flotte</Link></li>
              <li><Link href="/destinations">Destinations</Link></li>
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
              <li><Link href="#">contact@voyyacht.com</Link></li>
              <li><Link href="#">3, Quai des Milliardaires, Monaco</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 VoyYacht. Tous droits réservés.</span>
          <span className="footer-copy">
            <Link href="/legal" style={{ color: 'inherit', textDecoration: 'none' }}>Mentions légales</Link> · 
            <Link href="/legal" style={{ color: 'inherit', textDecoration: 'none' }}> Confidentialité</Link> · 
            <Link href="/legal" style={{ color: 'inherit', textDecoration: 'none' }}> CGV</Link>
          </span>
        </div>
      </footer>
    </main>
  );
}
