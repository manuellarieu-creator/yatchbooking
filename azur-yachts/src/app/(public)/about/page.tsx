import { Metadata } from 'next';
import Link from 'next/link';
import './about.css';
import AboutClientLogic from './AboutClientLogic';

export const metadata: Metadata = {
  title: 'À propos — VoyYacht',
  description: 'Découvrez l\'histoire de VoyYacht, notre mission, nos valeurs et l\'équipe qui rend le luxe nautique accessible depuis 2022.'
};

export default function AboutPage() {
  return (
    <div className="about-page-container">
      <AboutClientLogic />
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <svg className="hero-ship" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 320 L700 320 L620 220 L400 140 L180 220 Z" fill="#b8985a"/>
          <path d="M400 140 L400 40 L270 140 Z" fill="#b8985a"/>
          <path d="M400 140 L400 20 L530 140 Z" fill="#b8985a" opacity=".5"/>
          <line x1="100" y1="320" x2="700" y2="320" stroke="#b8985a" strokeWidth="3"/>
          <path d="M60 335 Q200 355 400 335 Q600 315 740 335" stroke="#b8985a" strokeWidth="2" fill="none" opacity=".4"/>
          <path d="M40 350 Q200 375 400 350 Q600 325 760 350" stroke="#b8985a" strokeWidth="1.5" fill="none" opacity=".2"/>
        </svg>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-eyebrow">Notre histoire</span>
          <h1 className="hero-title">L'excellence<br/>nautique depuis<br/><em>2022</em></h1>
          <div className="hero-divider"></div>
          <p className="hero-sub">VoyYacht est né d'une passion commune pour la mer et d'une conviction : <strong>chaque client mérite une expérience nautique d'exception</strong>, sans compromis sur la qualité, la sécurité ou la transparence.</p>
          <div className="hero-scroll">
            <div className="hero-scroll-line"></div>
            Découvrir notre histoire
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stat-item reveal">
          <div className="stat-num">340+</div>
          <div className="stat-label">Yachts disponibles</div>
          <div className="stat-sub">dans 68 destinations</div>
        </div>
        <div className="stat-item reveal reveal-delay-1">
          <div className="stat-num">3</div>
          <div className="stat-label">Années d'expertise</div>
          <div className="stat-sub">fondée en 2022 à La Ciotat</div>
        </div>
        <div className="stat-item reveal reveal-delay-2">
          <div className="stat-num">12000+</div>
          <div className="stat-label">Clients satisfaits</div>
          <div className="stat-sub">4,8/5 de note moyenne</div>
        </div>
        <div className="stat-item reveal reveal-delay-3">
          <div className="stat-num">98%</div>
          <div className="stat-label">Taux de satisfaction</div>
          <div className="stat-sub">basé sur 9 400 avis</div>
        </div>
      </div>

      {/* MISSION */}
      <section className="mission">
        <div className="mission-grid">
          <div className="mission-visual reveal">
            <div className="mission-img-main">
              <div className="mission-img-main-content">
                <div className="big-anchor">⚓</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: 'rgba(255,255,255,.15)', letterSpacing: '.1em' }}>VOY<span>YACHT</span></div>
              </div>
            </div>
            <div className="mission-img-sub">
              <div className="mission-img-sub-num">3</div>
              <div className="mission-img-sub-txt">Années<br/>d'excellence<br/>nautique</div>
            </div>
          </div>
          <div className="mission-text reveal reveal-delay-1">
            <span className="sec-eyebrow">Notre mission</span>
            <h2 className="sec-title">Rendre le luxe<br/>nautique <em>accessible</em></h2>
            <p className="mission-intro">"Offrir à chaque client une expérience en mer inoubliable, en toute sérénité."</p>
            <p className="mission-body">Depuis 2022, VoyYacht s'est imposé comme la référence de la location de yachts de prestige en Europe et au-delà. Notre plateforme met en relation des propriétaires vérifiés et des clients exigeants, avec un accompagnement humain à chaque étape.</p>
            <p className="mission-body">Nous croyons que la mer appartient à tous ceux qui rêvent de la parcourir. C'est pourquoi nous avons construit une plateforme simple, transparente et sécurisée, qui place l'humain au cœur de chaque interaction.</p>
            <div className="mission-values">
              <div className="value-item">
                <div className="value-icon">🔍</div>
                <div className="value-content">
                  <div className="value-title">Transparence totale</div>
                  <div className="value-desc">Chaque annonce est validée manuellement. Les prix, les conditions et les avis sont toujours affichés clairement.</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon">🛡️</div>
                <div className="value-content">
                  <div className="value-title">Sécurité au premier plan</div>
                  <div className="value-desc">Vérification d'identité vidéo obligatoire pour chaque annonceur. Toutes les réservations passent par notre équipe.</div>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon">🤝</div>
                <div className="value-content">
                  <div className="value-title">Accompagnement humain</div>
                  <div className="value-desc">Nos conseillers nautiques sont disponibles 7j/7 pour vous guider et résoudre chaque situation.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HISTOIRE / TIMELINE */}
      <section className="histoire">
        <div className="histoire-inner">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 0 }}>
            <span className="sec-eyebrow">Notre parcours</span>
            <h2 className="sec-title" style={{ marginBottom: '.5rem' }}>Une <em>décennie</em> d'innovation</h2>
            <p className="sec-desc" style={{ margin: '0 auto', textAlign: 'center' }}>Les grandes étapes qui ont façonné VoyYacht.</p>
          </div>
          <div className="timeline">
            <div className="tl-item reveal">
              <div className="tl-content">
                <div className="tl-title">Naissance à La Ciotat</div>
                <div className="tl-desc">VoyYacht est fondée par des passionnés de nautisme à La Ciotat. La première plateforme de mise en relation entre propriétaires et clients est lancée avec 12 yachts.</div>
              </div>
              <div className="tl-year-bubble"><div className="tl-year">2022</div></div>
              <div className="tl-empty"></div>
            </div>
            <div className="tl-item reveal">
              <div className="tl-empty"></div>
              <div className="tl-year-bubble"><div className="tl-year">2023</div></div>
              <div className="tl-content right">
                <div className="tl-title">Expansion méditerranéenne</div>
                <div className="tl-desc">La flotte dépasse les 80 yachts. Ouverture de bureaux et développement. Lancement du système de vérification des annonceurs.</div>
              </div>
            </div>
            <div className="tl-item reveal">
              <div className="tl-content">
                <div className="tl-title">Plateforme digitale nouvelle génération</div>
                <div className="tl-desc">Refonte complète de la plateforme avec réservation en ligne, chat intégré et calendrier de disponibilités en temps réel. 2 500 clients actifs.</div>
              </div>
              <div className="tl-year-bubble"><div className="tl-year">2024</div></div>
              <div className="tl-empty"></div>
            </div>
            <div className="tl-item reveal">
              <div className="tl-empty"></div>
              <div className="tl-year-bubble gold"><div className="tl-year" style={{ color: 'var(--navy)' }}>2025</div></div>
              <div className="tl-content right">
                <div className="tl-title">340 yachts, 68 destinations</div>
                <div className="tl-desc">VoyYacht devient la première plateforme de yacht charter premium en Europe avec 12 000+ clients satisfaits et une note moyenne de 4,8/5.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EQUIPE */}
      <section className="equipe">
        <div className="equipe-inner">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <span className="sec-eyebrow">Les visages d'VoyYacht</span>
            <h2 className="sec-title">Notre <em>équipe</em></h2>
            <p className="sec-desc" style={{ margin: '0 auto', textAlign: 'center' }}>Des professionnels passionnés par la mer et engagés pour votre satisfaction.</p>
          </div>
          <div className="team-grid">
            <div className="team-card reveal">
              <div className="team-photo" style={{ background: 'linear-gradient(145deg, #1a3a5a, #0a2040)' }}>
                <div className="team-photo-grad">
                  <div className="team-initials" style={{ color: 'rgba(184, 152, 90, .6)' }}>LB</div>
                </div>
                <div className="team-photo-overlay"></div>
              </div>
              <div className="team-body">
                <div className="team-name">Laurent Rodolphe BREYTON</div>
                <div className="team-role">Fondateur & Président</div>
                <div className="team-bio">Skipper professionnel depuis 20 ans, Laurent a fondé VoyYacht avec la vision de démocratiser le yacht charter de luxe.</div>
                <div className="team-langs"><span className="lang-chip">🇫🇷 FR</span><span className="lang-chip">🇬🇧 EN</span><span className="lang-chip">🇮🇹 IT</span></div>
              </div>
            </div>
            <div className="team-card reveal reveal-delay-1">
              <div className="team-photo" style={{ background: 'linear-gradient(145deg, #1a4a3a, #0a2a20)' }}>
                <div className="team-photo-grad">
                  <div className="team-initials" style={{ color: 'rgba(184, 152, 90, .6)' }}>SM</div>
                </div>
                <div className="team-photo-overlay"></div>
              </div>
              <div className="team-body">
                <div className="team-name">Sofia Marchetti</div>
                <div className="team-role">Directrice des opérations</div>
                <div className="team-bio">15 ans d'expérience dans le tourisme de luxe, Sofia supervise chaque réservation et garantit la qualité de l'expérience client.</div>
                <div className="team-langs"><span className="lang-chip">🇮🇹 IT</span><span className="lang-chip">🇫🇷 FR</span><span className="lang-chip">🇬🇧 EN</span></div>
              </div>
            </div>
            <div className="team-card reveal reveal-delay-2">
              <div className="team-photo" style={{ background: 'linear-gradient(145deg, #2a1a3a, #150a20)' }}>
                <div className="team-photo-grad">
                  <div className="team-initials" style={{ color: 'rgba(184, 152, 90, .6)' }}>AR</div>
                </div>
                <div className="team-photo-overlay"></div>
              </div>
              <div className="team-body">
                <div className="team-name">Alexandre Rousseau</div>
                <div className="team-role">Responsable annonceurs</div>
                <div className="team-bio">Alexandre accompagne chaque propriétaire dans la publication et l'optimisation de son annonce, et valide chaque dossier annonceur.</div>
                <div className="team-langs"><span className="lang-chip">🇫🇷 FR</span><span className="lang-chip">🇪🇸 ES</span><span className="lang-chip">🇬🇧 EN</span></div>
              </div>
            </div>
            <div className="team-card reveal reveal-delay-3">
              <div className="team-photo" style={{ background: 'linear-gradient(145deg, #1a2a4a, #0a1530)' }}>
                <div className="team-photo-grad">
                  <div className="team-initials" style={{ color: 'rgba(184, 152, 90, .6)' }}>NB</div>
                </div>
                <div className="team-photo-overlay"></div>
              </div>
              <div className="team-body">
                <div className="team-name">Nadia Benchekroun</div>
                <div className="team-role">Conseillère client senior</div>
                <div className="team-bio">Nadia est le premier contact de nos clients. Sa connaissance des destinations et sa disponibilité 7j/7 en font un pilier de l'équipe.</div>
                <div className="team-langs"><span className="lang-chip">🇫🇷 FR</span><span className="lang-chip">🇲🇦 AR</span><span className="lang-chip">🇬🇧 EN</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section className="valeurs">
        <div className="valeurs-inner">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <span className="sec-eyebrow" style={{ color: 'var(--gold)' }}>Ce en quoi nous croyons</span>
            <h2 className="sec-title white">Nos <em>valeurs</em> fondatrices</h2>
            <p className="sec-desc white" style={{ margin: '0 auto', textAlign: 'center' }}>Six principes qui guident chacune de nos décisions, chaque jour.</p>
          </div>
          <div className="valeurs-grid">
            <div className="valeur-card reveal">
              <div className="valeur-num">01</div>
              <div className="valeur-title">Confiance</div>
              <div className="valeur-desc">Chaque annonceur est vérifié, chaque annonce est validée. La confiance n'est pas un argument commercial — c'est notre engagement quotidien.</div>
            </div>
            <div className="valeur-card reveal reveal-delay-1">
              <div className="valeur-num">02</div>
              <div className="valeur-title">Excellence</div>
              <div className="valeur-desc">Nous ne publions que des yachts répondant à nos standards de qualité. La médiocrité n'a pas sa place dans notre flotte.</div>
            </div>
            <div className="valeur-card reveal reveal-delay-2">
              <div className="valeur-num">03</div>
              <div className="valeur-title">Transparence</div>
              <div className="valeur-desc">Prix clairs, conditions lisibles, avis certifiés. Pas de mauvaise surprise : ce que vous voyez est ce que vous obtenez.</div>
            </div>
            <div className="valeur-card reveal">
              <div className="valeur-num">04</div>
              <div className="valeur-title">Accessibilité</div>
              <div className="valeur-desc">Le luxe nautique doit être accessible à tous ceux qui en rêvent. Notre plateforme simplifie chaque étape de la location.</div>
            </div>
            <div className="valeur-card reveal reveal-delay-1">
              <div className="valeur-num">05</div>
              <div className="valeur-title">Durabilité</div>
              <div className="valeur-desc">Nous encourageons des pratiques nautiques respectueuses de l'environnement marin et privilégions les annonceurs éco-responsables.</div>
            </div>
            <div className="valeur-card reveal reveal-delay-2">
              <div className="valeur-num">06</div>
              <div className="valeur-title">Humanité</div>
              <div className="valeur-desc">Derrière chaque réservation, il y a des personnes. Nos conseillers sont là, disponibles et attentifs, pour chaque question.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLES */}
      <section className="chiffres">
        <div className="chiffres-inner">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <span className="sec-eyebrow">En chiffres</span>
            <h2 className="sec-title">VoyYacht <em>aujourd'hui</em></h2>
          </div>
          <div className="chiffres-grid">
            <div className="chiffre-card reveal">
              <span className="chiffre-icon">⚓</span>
              <div className="chiffre-num">340+</div>
              <div className="chiffre-label">Yachts référencés</div>
              <div className="chiffre-desc">Voiliers, catamarans, motor yachts et superyachts dans 68 destinations</div>
            </div>
            <div className="chiffre-card reveal reveal-delay-1">
              <span className="chiffre-icon">🌍</span>
              <div className="chiffre-num">68</div>
              <div className="chiffre-label">Destinations mondiales</div>
              <div className="chiffre-desc">De la Méditerranée aux Caraïbes, en passant par l'Asie du Sud-Est</div>
            </div>
            <div className="chiffre-card reveal reveal-delay-2">
              <span className="chiffre-icon">👥</span>
              <div className="chiffre-num">12K+</div>
              <div className="chiffre-label">Clients satisfaits</div>
              <div className="chiffre-desc">Clients venus de 42 pays différents, avec une note moyenne de 4,8/5</div>
            </div>
            <div className="chiffre-card reveal">
              <span className="chiffre-icon">✅</span>
              <div className="chiffre-num">100%</div>
              <div className="chiffre-label">Annonceurs vérifiés</div>
              <div className="chiffre-desc">Vérification d'identité vidéo et validation manuelle de chaque annonce</div>
            </div>
            <div className="chiffre-card reveal reveal-delay-1">
              <span className="chiffre-icon">⭐</span>
              <div className="chiffre-num">4.8</div>
              <div className="chiffre-label">Note moyenne</div>
              <div className="chiffre-desc">Basée sur plus de 9 400 avis certifiés de clients ayant effectivement navigué</div>
            </div>
            <div className="chiffre-card reveal reveal-delay-2">
              <span className="chiffre-icon">🕐</span>
              <div className="chiffre-num">7j/7</div>
              <div className="chiffre-label">Disponibilité support</div>
              <div className="chiffre-desc">Notre équipe vous répond en moins de 2h, tous les jours de l'année</div>
            </div>
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="temoignages">
        <div className="temoignages-inner">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <span className="sec-eyebrow">Ils nous font confiance</span>
            <h2 className="sec-title">Ce que disent<br/>nos <em>clients</em></h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card reveal">
              <span className="testi-quote">"</span>
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">Une semaine en Grèce à bord de l'Azura 68 — un rêve devenu réalité. L'équipage était d'une attention extraordinaire, le yacht immaculé. Je recommande VoyYacht les yeux fermés.</p>
              <div className="testi-author">
                <div className="testi-av">SL</div>
                <div><div className="testi-name">Sophie Lemaire</div><div className="testi-loc">Paris, France · Juil. 2024</div></div>
              </div>
            </div>
            <div className="testi-card reveal reveal-delay-1">
              <span className="testi-quote">"</span>
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">Service irréprochable de A à Z. La réservation était simple, le yacht exactement comme sur les photos. La Côte d'Azur vue depuis la mer est tout simplement magique.</p>
              <div className="testi-author">
                <div className="testi-av">MR</div>
                <div><div className="testi-name">Marco Ricci</div><div className="testi-loc">Milan, Italie · Août 2024</div></div>
              </div>
            </div>
            <div className="testi-card reveal reveal-delay-2">
              <span className="testi-quote">"</span>
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">Notre anniversaire de mariage aux Caraïbes. VoyYacht a tout planifié à la perfection — le catamaran, le chef, les excursions. Une expérience absolument mémorable.</p>
              <div className="testi-author">
                <div className="testi-av">AC</div>
                <div><div className="testi-name">Amelia & Robert Chen</div><div className="testi-loc">Londres, UK · Sept. 2024</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <div className="cta-final">
        <div className="cta-final-inner reveal">
          <span className="cta-final-eyebrow">Prêt à larguer les amarres ?</span>
          <h2 className="cta-final-title">Votre prochaine<br/>aventure en mer vous <em>attend</em></h2>
          <p className="cta-final-sub">Rejoignez 12 000 clients qui nous font confiance. Trouvez votre yacht idéal parmi plus de 340 embarcations d'exception dans 68 destinations mondiales.</p>
          <div className="cta-btns">
            <button className="btn btn-gold">Explorer la flotte</button>
            <button className="btn btn-outline">Mettre mon yacht en location</button>
          </div>
        </div>
      </div>
    </div>
  );
}
