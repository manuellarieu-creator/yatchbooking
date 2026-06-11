'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import './faq.css';

const FAQ_DATA = [
  // ── LOCATION ──
  { id: 'l1', cat: 'location', q: "Comment fonctionne la location de yacht sur Azur Yachts ?", a: "Azur Yachts est une plateforme de mise en relation entre propriétaires de yachts vérifiés et clients. Vous choisissez votre yacht, sélectionnez vos dates, soumettez une demande de réservation, effectuez le paiement, et notre équipe valide l'ensemble. Chaque annonceur est vérifié individuellement par notre équipe avant de pouvoir publier une annonce." },
  { id: 'l2', cat: 'location', q: "Combien de personnes peuvent monter à bord ?", a: "Chaque annonce précise le nombre maximal de personnes autorisées à bord, distinguant adultes et enfants. Cette limite est définie par le propriétaire et doit être strictement respectée pour des raisons de sécurité maritime. Vous retrouvez cette information directement sur la fiche du yacht et dans le widget de réservation." },
  { id: 'l3', cat: 'location', q: "Un capitaine ou un skipper est-il inclus dans la location ?", a: "Cela dépend de l'annonce. Chaque fiche yacht indique clairement si un capitaine est requis (obligatoire par le propriétaire) ou si un skipper est disponible en option. Si vous êtes titulaire d'un permis de navigation valide, certains yachts peuvent être loués sans équipage. Ces informations sont visibles sur la fiche avant réservation." },
  { id: 'l4', cat: 'location', q: "Les animaux domestiques sont-ils acceptés à bord ?", a: "La possibilité d'embarquer des animaux de compagnie est définie par chaque propriétaire individuellement. Lors de votre réservation, vous pouvez indiquer que vous souhaitez venir avec un animal. En cas de doute, nous vous recommandons de contacter directement le propriétaire via le chat intégré à la fiche du yacht." },
  { id: 'l5', cat: 'location', q: "Le yacht peut-il être livré dans le port de mon choix ?", a: "Certains annonceurs proposent un service de livraison du yacht dans le port souhaité par le client, moyennant des frais supplémentaires définis sur l'annonce. Cette option est clairement indiquée sur la fiche yacht et peut être cochée lors de la réservation, avec un champ pour préciser le port souhaité." },
  { id: 'l6', cat: 'location', q: "Que comprend le tarif affiché ?", a: "Le tarif affiché est le prix de location du yacht par jour. À ce montant s'ajoutent obligatoirement les frais de nettoyage définis par le propriétaire, et optionnellement les services additionnels que vous sélectionnez (chef, skipper, équipement, livraison…). Le récapitulatif complet est affiché dans le widget de réservation avant toute confirmation." },
  { id: 'l7', cat: 'location', q: "J'ai un code de réduction, comment l'utiliser ?", a: "Sur la fiche du yacht, dans le widget de réservation, vous trouverez un champ \"Code de réduction\". Saisissez votre code et cliquez sur \"Appliquer\" — la réduction sera immédiatement appliquée au total affiché. Les codes sont disponibles via notre newsletter et nos communications saisonnières." },

  // ── RÉSERVATION ──
  { id: 'r1', cat: 'reservation', q: "Comment vérifier la disponibilité d'un yacht ?", a: "Sur chaque fiche yacht, un calendrier de disponibilité affiche en temps réel les dates disponibles (fond vert), réservées (fond rouge rayé) et passées (grisées). Vous pouvez également utiliser la barre de recherche de la page d'accueil ou du listing en saisissant votre destination et vos dates — seuls les yachts disponibles sur votre plage s'afficheront." },
  { id: 'r2', cat: 'reservation', q: "Dans quel délai ma réservation est-elle confirmée ?", a: "Toutes les réservations sont validées manuellement par notre équipe. Une fois votre paiement reçu et vérifié, votre réservation est généralement confirmée sous 24 à 48 heures ouvrées. Vous recevez un email de confirmation avec tous les détails de votre séjour." },
  { id: 'r3', cat: 'reservation', q: "Puis-je modifier mes dates après confirmation ?", a: "Toute modification de dates après confirmation est soumise à l'approbation du propriétaire et à la disponibilité du yacht. Pour faire une demande de modification, contactez notre équipe via le chat ou par email. Des frais de modification peuvent s'appliquer selon les conditions de l'annonce." },
  { id: 'r4', cat: 'reservation', q: "Quelle est la politique d'annulation ?", a: "Chaque annonceur définit sa propre politique d'annulation : flexible (remboursement total jusqu'à 48h avant), modérée (50% jusqu'à 7 jours avant) ou stricte (non remboursable). Cette politique est toujours affichée sur la fiche yacht avant toute réservation. Les annulations doivent être adressées à notre équipe qui gère la relation avec le propriétaire." },
  { id: 'r5', cat: 'reservation', q: "Puis-je consulter toutes mes réservations depuis mon compte ?", a: "Oui, depuis votre espace client dans la section \"Mes réservations\", vous pouvez consulter l'historique complet de vos réservations, leur statut en temps réel (en attente, confirmée, terminée, annulée), les détails financiers, et télécharger vos factures ou bons de réservation." },

  // ── PAIEMENT ──
  { id: 'p1', cat: 'paiement', q: "Quels modes de paiement sont acceptés ?", a: "Azur Yachts accepte trois modes de paiement, configurés par notre équipe : carte bancaire via Stripe (Visa, Mastercard, Amex), PayPal, ou virement bancaire SEPA / instantané. Le mode disponible est affiché sur la page de paiement au moment de votre réservation." },
  { id: 'p2', cat: 'paiement', q: "Comment fonctionne le paiement par virement bancaire ?", a: "Après votre demande de réservation, vous recevez les coordonnées bancaires (IBAN, BIC, titulaire) et une référence unique à indiquer sur votre virement. Vous disposez de 24h pour effectuer le virement et soumettre votre preuve de paiement via la page de réservation. Un email de relance est automatiquement envoyé 1h après la réservation si aucune preuve n'est soumise, puis une seconde relance 2h plus tard." },
  { id: 'p3', cat: 'paiement', q: "Combien de temps pour que mon virement soit validé ?", a: "Pour un virement SEPA standard, comptez 36 à 48 heures après réception de votre preuve. Pour un virement instantané, la validation intervient en 30 à 45 minutes. Notre équipe vérifie manuellement chaque justificatif avant de confirmer la réservation." },
  { id: 'p4', cat: 'paiement', q: "Que se passe-t-il si je ne paie pas dans les 24h ?", a: "Si aucune preuve de paiement n'est soumise dans les 24 heures suivant votre demande de réservation, celle-ci est automatiquement annulée et les dates redeviennent disponibles. Aucun montant n'est débité. Vous pouvez soumettre une nouvelle demande à tout moment si les dates sont toujours libres." },
  { id: 'p5', cat: 'paiement', q: "Mon paiement est-il sécurisé ?", a: "Oui. Les paiements par carte sont traités par Stripe, certifié PCI-DSS niveau 1 — nous ne stockons jamais vos données bancaires. Les paiements PayPal bénéficient de la protection acheteur PayPal. Pour les virements, vos coordonnées bancaires personnelles ne sont jamais communiquées aux propriétaires." },
  { id: 'p6', cat: 'paiement', q: "Comment obtenir une facture ?", a: "Votre facture est automatiquement générée après confirmation du paiement et disponible dans votre espace client, section \"Mes réservations\". Vous pouvez la télécharger en PDF à tout moment. Pour toute demande de facture pro avec numéro de TVA intracommunautaire, contactez notre équipe." },

  // ── ANNONCEUR ──
  { id: 'a1', cat: 'annonceur', q: "Comment publier mon yacht sur Azur Yachts ?", a: "Créez un compte annonceur, effectuez la vérification d'identité vidéo, puis complétez le formulaire d'annonce en 7 étapes (informations personnelles, détails du bateau, photos, tarification, services, disponibilités, aperçu). Votre annonce est mise en ligne après validation manuelle par notre équipe sous 24 à 48h ouvrées." },
  { id: 'a2', cat: 'annonceur', q: "En quoi consiste la vérification vidéo selfie ?", a: "La vérification vidéo est obligatoire pour tous les annonceurs. Vous enregistrez une courte vidéo (10-15 secondes) via votre webcam en tenant votre pièce d'identité face à la caméra. Notre équipe visionne et valide manuellement la vidéo. Une fois validé, le badge ✓ Vérifié apparaît sur toutes vos annonces, renforçant la confiance des clients." },
  { id: 'a3', cat: 'annonceur', q: "Combien de photos puis-je ajouter à mon annonce ?", a: "Vous pouvez uploader jusqu'à 40 photos par annonce (JPG, PNG, WEBP — 10 Mo max par image). Les images sont réorganisables par glisser-déposer. Nous recommandons un minimum de 8 à 10 photos de qualité : extérieur, cockpit, cabines, salle de bains, équipements, et vues depuis le pont." },
  { id: 'a4', cat: 'annonceur', q: "Quels sont les différents niveaux d'annonceur ?", a: "Azur Yachts propose trois niveaux d'annonceur définis par notre équipe : Standard (accès de base), Premium (mise en avant dans les résultats), et Platinium (visibilité maximale, badge doré, priorité de réservation). Le niveau est attribué par notre administration en fonction du volume et de la qualité des annonces." },
  { id: 'a5', cat: 'annonceur', q: "Comment définir mes disponibilités et bloquer des dates ?", a: "Depuis votre tableau de bord annonceur, vous pouvez gérer votre calendrier de disponibilités : sélectionner des plages disponibles (affichées en vert) ou bloquer des dates pour usage personnel (affichées en gris). Si aucune disponibilité n'est renseignée, le yacht est considéré disponible immédiatement." },

  // ── SÉCURITÉ ──
  { id: 's1', cat: 'securite', q: "Comment Azur Yachts garantit-il la fiabilité des annonceurs ?", a: "Chaque annonceur est soumis à une vérification d'identité par vidéo selfie validée manuellement, à la validation de chaque annonce par notre équipe, et à un système d'avis certifiés. Toutes les réservations et communications passent par notre plateforme — nous agissons comme tiers de confiance entre clients et propriétaires." },
  { id: 's2', cat: 'securite', q: "Mes données personnelles sont-elles protégées ?", a: "Oui. Azur Yachts est conforme au RGPD. Vos données sont chiffrées, jamais revendues à des tiers, et utilisées uniquement dans le cadre de votre utilisation de la plateforme. Vous pouvez à tout moment demander l'export ou la suppression de vos données depuis votre espace personnel, section \"Activité du compte\"." },
  { id: 's3', cat: 'securite', q: "Que faire en cas de litige avec un propriétaire ?", a: "En cas de litige, contactez immédiatement notre équipe via le formulaire de contact ou par email. Toutes les communications passant par notre plateforme, nous avons accès à l'historique complet des échanges et pouvons intervenir rapidement. Nous agissons comme médiateur entre les parties et traitons chaque litige dans un délai de 48h ouvrées." },

  // ── COMPTE ──
  { id: 'c1', cat: 'compte', q: "Comment réinitialiser mon mot de passe ?", a: "Sur la page de connexion, cliquez sur \"Mot de passe oublié\" et saisissez votre adresse email. Vous recevrez un lien de réinitialisation valable 1 heure. Si vous ne recevez pas d'email, vérifiez vos spams ou contactez notre support." },
  { id: 'c2', cat: 'compte', q: "Comment supprimer mon compte ?", a: "Depuis votre profil, rubrique \"Zone sensible\", vous trouverez l'option de suppression de compte. La suppression est définitive et irréversible — toutes vos données seront effacées. Si vous avez des réservations actives, celles-ci doivent être annulées au préalable. Un email de confirmation vous sera envoyé avant la suppression effective." },
];

const CATEGORIES = [
  { id: 'all', icon: '📋', label: 'Toutes' },
  { id: 'location', icon: '⚓', label: 'Location' },
  { id: 'reservation', icon: '📅', label: 'Réservation' },
  { id: 'paiement', icon: '💳', label: 'Paiement' },
  { id: 'annonceur', icon: '🚢', label: 'Annonceurs' },
  { id: 'securite', icon: '🔒', label: 'Sécurité' },
  { id: 'compte', icon: '👤', label: 'Mon compte' },
];

export default function FAQPage() {
  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3200);
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter logic
  const filteredData = useMemo(() => {
    let data = FAQ_DATA;
    if (activeCat !== 'all') {
      data = data.filter(item => item.cat === activeCat);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      data = data.filter(item => 
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      );
    }
    return data;
  }, [activeCat, searchQuery]);

  const groupByCategory = (data: typeof FAQ_DATA) => {
    const groups: Record<string, typeof FAQ_DATA> = {};
    data.forEach(item => {
      if (!groups[item.cat]) groups[item.cat] = [];
      groups[item.cat].push(item);
    });
    return groups;
  };

  const groupedResults = groupByCategory(filteredData);
  const totalResults = filteredData.length;

  return (
    <div className="faq-page-container">
      {/* HERO */}
      <div className="hero">
        <svg className="hero-deco" width="380" height="150" viewBox="0 0 600 200" fill="none">
          <path d="M50 160 L550 160 L480 110 L300 80 L120 110 Z" fill="#b8985a"/>
          <path d="M300 80 L300 20 L200 80 Z" fill="#b8985a"/>
          <path d="M300 80 L300 10 L410 80 Z" fill="#b8985a" opacity=".5"/>
          <line x1="50" y1="160" x2="550" y2="160" stroke="#b8985a" strokeWidth="2"/>
        </svg>
        <div className="hero-inner">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link><span className="sep">/</span>
            <span className="current">FAQ</span>
          </div>
          <span className="eyebrow">Centre d'aide</span>
          <h1 className="hero-title">Questions <em>fréquentes</em></h1>
          <p className="hero-sub">Retrouvez toutes les réponses aux questions les plus posées par nos clients et annonceurs. Si vous ne trouvez pas ce que vous cherchez, notre équipe est disponible 7j/7.</p>
          <div className="hero-search">
            <input 
              className="hero-search-input" 
              type="text" 
              placeholder="Rechercher une question…" 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button className="hero-search-btn" onClick={() => handleSearch(searchQuery)}>🔍</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-num">28</span><span className="hero-stat-lbl">Questions répondues</span></div>
            <div className="hero-stat"><span className="hero-stat-num">6</span><span className="hero-stat-lbl">Catégories</span></div>
            <div className="hero-stat"><span className="hero-stat-num">98%</span><span className="hero-stat-lbl">Taux de satisfaction</span></div>
          </div>
        </div>
      </div>

      {/* PAGE BODY */}
      <div className="page-body">
        
        {/* SIDEBAR */}
        <aside className="cat-sidebar">
          <div className="cat-title">Catégories</div>
          <nav className="cat-nav">
            {CATEGORIES.map(cat => {
              const count = cat.id === 'all' 
                ? FAQ_DATA.length 
                : FAQ_DATA.filter(f => f.cat === cat.id).length;
                
              return (
                <div 
                  key={cat.id} 
                  className={`cat-item ${activeCat === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCat(cat.id)}
                >
                  <div className="cat-item-left">
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-label">{cat.label}</span>
                  </div>
                  <span className="cat-count">{count}</span>
                </div>
              );
            })}
          </nav>

          <div className="contact-nudge">
            <div className="nudge-title">Vous ne trouvez pas ?</div>
            <div className="nudge-sub">Notre équipe est disponible 7j/7 pour répondre à toutes vos questions.</div>
            <Link href="/contact" className="nudge-btn" style={{ textDecoration: 'none' }}>Nous contacter →</Link>
          </div>
        </aside>

        {/* FAQ CONTENT */}
        <main id="faq-main">
          {searchQuery && (
            <div className="search-result-bar visible">
              <span id="search-result-text">
                {totalResults} résultat{totalResults > 1 ? 's' : ''} pour "{searchQuery}"
              </span>
              <button className="clear-search" onClick={() => setSearchQuery('')}>Effacer ✕</button>
            </div>
          )}

          {totalResults === 0 ? (
            <div className="no-results" style={{ display: 'block' }}>
              <div className="no-results-icon">🔍</div>
              <div className="no-results-title">Aucun résultat trouvé</div>
              <div className="no-results-sub">Essayez avec d'autres mots-clés ou <Link href="/contact" style={{ color: 'var(--gold)' }}>contactez-nous</Link> directement.</div>
            </div>
          ) : (
            CATEGORIES.filter(c => c.id !== 'all').map((cat, idx) => {
              const catData = groupedResults[cat.id];
              if (!catData || catData.length === 0) return null;

              return (
                <div key={cat.id} className="faq-category" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <div className="cat-section-header">
                    <div className="cat-section-icon">{cat.icon}</div>
                    <h2 className="cat-section-title">
                      {cat.id === 'location' && <>Location de <em>yacht</em></>}
                      {cat.id === 'reservation' && <>Réservation & <em>disponibilités</em></>}
                      {cat.id === 'paiement' && <>Paiement & <em>sécurité financière</em></>}
                      {cat.id === 'annonceur' && <>Espace <em>annonceur</em></>}
                      {cat.id === 'securite' && <>Sécurité & <em>confiance</em></>}
                      {cat.id === 'compte' && <>Mon <em>compte</em></>}
                    </h2>
                    <span className="cat-section-count">{catData.length} questions</span>
                  </div>

                  {catData.map((faq, index) => {
                    const isOpen = !!openItems[faq.id];
                    const num = (index + 1).toString().padStart(2, '0');
                    return (
                      <div key={faq.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
                        <div className="faq-q" onClick={() => toggleItem(faq.id)}>
                          <span className="faq-q-num">{num}</span>
                          <span className="faq-q-text">{faq.q}</span>
                          <span className="faq-arrow">▾</span>
                        </div>
                        <div className="faq-a">
                          <p className="faq-a-text">{faq.a}</p>
                          <div className="faq-helpful">
                            <span className="helpful-label">Cette réponse vous a-t-elle aidé ?</span>
                            <button className="helpful-btn" onClick={() => triggerToast('Merci pour votre avis !')}>👍 Oui</button>
                            <button className="helpful-btn" onClick={() => triggerToast('Merci pour votre retour.')}>👎 Non</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </main>
      </div>

      {/* CTA BANNER */}
      <div className="cta-banner">
        <div className="cta-text">
          <div className="cta-title">Vous n'avez pas trouvé votre <em>réponse</em> ?</div>
          <div className="cta-sub">Notre équipe de conseillers nautiques est disponible 7j/7 pour vous accompagner.</div>
        </div>
        <div className="cta-actions">
          <Link href="/contact" className="cta-btn cta-btn-gold" style={{ textDecoration: 'none' }}>Nous contacter</Link>
          <button className="cta-btn cta-btn-outline" onClick={() => triggerToast('Ouverture du chat…')}>💬 Chat en direct</button>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span>{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
