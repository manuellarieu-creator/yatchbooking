'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './legal.css';

const TAB_DATA = {
  cgu: {
    id: 'cgu',
    label: 'Conditions générales',
    sections: [
      { id: 'cgu-1', title: 'Objet & définitions' },
      { id: 'cgu-2', title: 'Création de compte' },
      { id: 'cgu-3', title: 'Publication d\'annonces' },
      { id: 'cgu-4', title: 'Processus de réservation' },
      { id: 'cgu-5', title: 'Conditions financières' },
      { id: 'cgu-6', title: 'Politique d\'annulation' },
      { id: 'cgu-7', title: 'Responsabilités' },
      { id: 'cgu-8', title: 'Droit applicable' }
    ]
  },
  mentions: {
    id: 'mentions',
    label: 'Mentions légales',
    sections: [
      { id: 'ml-1', title: 'Identification éditeur' },
      { id: 'ml-2', title: 'Hébergeur' },
      { id: 'ml-3', title: 'Propriété intellectuelle' },
      { id: 'ml-4', title: 'Liens hypertextes' }
    ]
  },
  confidentialite: {
    id: 'confidentialite',
    label: 'Confidentialité & RGPD',
    sections: [
      { id: 'rgpd-1', title: 'Responsable du traitement' },
      { id: 'rgpd-2', title: 'Données & finalités' },
      { id: 'rgpd-3', title: 'Durée de conservation' },
      { id: 'rgpd-4', title: 'Vos droits RGPD' }
    ]
  },
  cookies: {
    id: 'cookies',
    label: 'Politique cookies',
    sections: [
      { id: 'ck-1', title: 'Qu\'est-ce qu\'un cookie ?' },
      { id: 'ck-2', title: 'Types de cookies' },
      { id: 'ck-3', title: 'Gérer vos préférences' }
    ]
  }
};

type TabKey = keyof typeof TAB_DATA;

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('cgu');
  const [activeSection, setActiveSection] = useState<string>('cgu-1');
  const [progress, setProgress] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(false);
    setTimeout(() => setShowToast(true), 50);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => triggerToast('Lien copié !'));
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Progress bar
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      setProgress(pct);

      // Scroll Spy
      const sections = TAB_DATA[activeTab].sections;
      let current = sections[0].id;
      sections.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (el && el.getBoundingClientRect().top <= 160) {
          current = sec.id;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  return (
    <div className="legal-page-container">
      {/* PROGRESS BAR */}
      <div className="reading-progress">
        <div className="reading-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="hero-inner">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link><span className="sep">/</span>
            <span className="current">CGU & Mentions légales</span>
          </div>
          <span className="eyebrow">Documents légaux</span>
          <h1 className="hero-title">Conditions générales &<br/><em>Mentions légales</em></h1>
          <div className="hero-meta">
            <div className="hero-meta-item">📅 <strong>Dernière mise à jour :</strong> 1er juin 2026</div>
            <div className="hero-meta-item">🌐 <strong>Droit applicable :</strong> Droit Français</div>
            <div className="hero-meta-item">📍 <strong>Siège social :</strong> La Ciotat</div>
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div className="tab-bar">
        {(Object.keys(TAB_DATA) as TabKey[]).map(key => (
          <button 
            key={key}
            className={`tab-btn ${activeTab === key ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab(key);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {TAB_DATA[key].label}
          </button>
        ))}
      </div>

      {/* PAGE BODY */}
      <div className="page-body">
        
        {/* TOC */}
        <aside className="toc-sidebar">
          <div className="toc-title">Sommaire</div>
          <ul className="toc-list">
            {TAB_DATA[activeTab].sections.map((sec, i) => (
              <li key={sec.id} className="toc-item">
                <button 
                  className={activeSection === sec.id ? 'active' : ''}
                  onClick={() => scrollTo(sec.id)}
                >
                  {sec.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* CONTENT */}
        <div className="content-area">
          <div className="doc-actions">
            <button className="doc-action-btn" onClick={handlePrint}>🖨️ Imprimer</button>
            <button className="doc-action-btn" onClick={() => triggerToast('Téléchargement PDF en cours…')}>📄 Télécharger PDF</button>
            <button className="doc-action-btn" onClick={copyLink}>🔗 Copier le lien</button>
          </div>

          {/* ══════════ CGU ══════════ */}
          {activeTab === 'cgu' && (
            <div className="tab-content active">
              <div className="info-box gold" style={{ marginBottom: '2rem' }}>
                📌 En utilisant la plateforme VoyYacht, vous acceptez les présentes conditions générales d'utilisation dans leur intégralité. Veuillez les lire attentivement avant toute inscription ou réservation.
              </div>

              <div className="doc-section" id="cgu-1">
                <div className="doc-section-header">
                  <div className="doc-section-num">01</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Définitions</span>
                    <div className="doc-section-title">Objet & définitions</div>
                  </div>
                </div>
                <div className="prose">
                  <p>Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'accès et l'utilisation de la plateforme VoyYacht, accessible à l'adresse <Link href="/">www.voyyacht.com</Link>, exploitée par la société <strong>KEDYEM SAS</strong>, société par actions simplifiée, immatriculée au Registre du Commerce et des Sociétés sous le numéro SIREN 913 031 241 (SIRET 913 031 241 00015), dont le siège social est situé 381 CHEMIN DES CARRIERES, LA CIOTAT, 13600.</p>
                  <h4>Définitions</h4>
                  <ul>
                    <li><strong>Plateforme :</strong> le site web et les applications mobiles VoyYacht permettant la mise en relation entre Annonceurs et Clients.</li>
                    <li><strong>Annonceur :</strong> tout utilisateur propriétaire d'un yacht qui publie une annonce de location sur la Plateforme après vérification et validation par l'Administrateur.</li>
                    <li><strong>Client :</strong> tout utilisateur qui effectue ou envisage d'effectuer une réservation via la Plateforme.</li>
                    <li><strong>Administrateur :</strong> l'équipe KEDYEM SAS qui valide les annonces, les réservations et les paiements.</li>
                    <li><strong>Réservation :</strong> la demande de location d'un yacht pour une période définie, soumise au paiement et à la validation de l'Administrateur.</li>
                  </ul>
                </div>
              </div>

              <div className="doc-section" id="cgu-2">
                <div className="doc-section-header">
                  <div className="doc-section-num">02</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Inscription</span>
                    <div className="doc-section-title">Création de compte & conditions d'accès</div>
                  </div>
                </div>
                <div className="prose">
                  <p>L'accès à certaines fonctionnalités de la Plateforme nécessite la création d'un compte utilisateur. L'inscription est ouverte à toute personne physique majeure (18 ans ou plus) disposant d'une adresse email valide.</p>
                  <h4>Conditions spécifiques aux Annonceurs</h4>
                  <p>Tout utilisateur souhaitant publier une annonce doit en outre :</p>
                  <ul>
                    <li>Créer un compte de type "Annonceur" et fournir des informations exactes et complètes ;</li>
                    <li>Réaliser et soumettre une <strong>vérification d'identité vidéo</strong> (selfie vidéo avec pièce d'identité officielle) ;</li>
                    <li>Obtenir la validation de son compte par l'Administrateur avant toute publication ;</li>
                    <li>S'assurer que le yacht annoncé lui appartient légalement ou qu'il dispose des autorisations nécessaires pour le louer.</li>
                  </ul>
                  <div className="info-box navy">
                    L'Administrateur se réserve le droit de refuser, suspendre ou supprimer tout compte Annonceur sans justification, notamment en cas de fourniture d'informations erronées, de comportement frauduleux ou de non-respect des présentes CGU.
                  </div>
                  <p>L'utilisateur s'engage à maintenir la confidentialité de ses identifiants de connexion et à notifier immédiatement VoyYacht de tout accès non autorisé à son compte.</p>
                </div>
              </div>

              <div className="doc-section" id="cgu-3">
                <div className="doc-section-header">
                  <div className="doc-section-num">03</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Annonces</span>
                    <div className="doc-section-title">Publication & gestion des annonces</div>
                  </div>
                </div>
                <div className="prose">
                  <p>Les Annonceurs peuvent publier des annonces de location de yachts sur la Plateforme, sous réserve de validation préalable par l'Administrateur. Chaque annonce doit contenir des informations exactes, complètes et à jour concernant le yacht proposé.</p>
                  <h4>Contenu des annonces</h4>
                  <ul>
                    <li>Le titre et la description doivent être rédigés en français et/ou en anglais ;</li>
                    <li>Les photos (maximum 40) doivent représenter fidèlement le yacht annoncé ;</li>
                    <li>Le prix affiché doit être le tarif réel par jour, hors services optionnels ;</li>
                    <li>Les frais de nettoyage, obligatoires, doivent être clairement définis ;</li>
                    <li>La capacité maximale à bord (adultes et enfants) doit être renseignée avec exactitude.</li>
                  </ul>
                  <h4>Validation et modération</h4>
                  <p>Toute annonce est soumise à la validation de l'Administrateur avant publication. VoyYacht se réserve le droit de refuser, modifier ou supprimer toute annonce ne respectant pas les présentes CGU ou les standards de qualité de la Plateforme, sans que cela ne donne lieu à une quelconque indemnité au profit de l'Annonceur.</p>
                </div>
              </div>

              <div className="doc-section" id="cgu-4">
                <div className="doc-section-header">
                  <div className="doc-section-num">04</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Réservations</span>
                    <div className="doc-section-title">Processus de réservation</div>
                  </div>
                </div>
                <div className="prose">
                  <p>Le processus de réservation sur la Plateforme se déroule en plusieurs étapes :</p>
                  <ol>
                    <li>Le Client sélectionne un yacht et ses dates, renseigne le nombre d'invités et les services souhaités ;</li>
                    <li>La demande de réservation est soumise et crée un engagement ferme de paiement de la part du Client ;</li>
                    <li>Le Client est redirigé vers la page de paiement et dispose de <strong>24 heures</strong> pour finaliser son paiement ;</li>
                    <li>À réception et vérification du paiement, l'Administrateur confirme la réservation sous 24 à 48 heures ouvrées ;</li>
                    <li>Un email de confirmation est envoyé au Client et à l'Annonceur.</li>
                  </ol>
                  <div className="info-box warn">
                    ⚠️ Toute demande de réservation non suivie d'un paiement dans les 24 heures est automatiquement annulée. Aucun montant n'est débité dans ce cas. Deux emails de relance sont envoyés automatiquement (à T+1h et T+3h) pour rappeler au Client de finaliser son paiement.
                  </div>
                  <h4>Double réservation</h4>
                  <p>La Plateforme bloque les dates dès la soumission d'une demande de réservation afin d'éviter toute double réservation. En cas de litige sur ce point, l'Administrateur arbitre de façon définitive.</p>
                </div>
              </div>

              <div className="doc-section" id="cgu-5">
                <div className="doc-section-header">
                  <div className="doc-section-num">05</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Paiement</span>
                    <div className="doc-section-title">Conditions financières & paiement</div>
                  </div>
                </div>
                <div className="prose">
                  <p>VoyYacht propose trois modes de paiement, selon la configuration active de la Plateforme décidée par l'Administrateur :</p>
                  <table className="legal-table">
                    <thead><tr><th>Mode</th><th>Délai de confirmation</th><th>Preuve requise</th></tr></thead>
                    <tbody>
                      <tr><td><strong>Carte bancaire (Stripe)</strong></td><td>Immédiat</td><td>Non</td></tr>
                      <tr><td><strong>PayPal</strong></td><td>Immédiat</td><td>Non</td></tr>
                      <tr><td><strong>Virement SEPA standard</strong></td><td>36 à 48 heures</td><td>Oui (justificatif)</td></tr>
                      <tr><td><strong>Virement instantané</strong></td><td>30 à 45 minutes</td><td>Oui (justificatif)</td></tr>
                    </tbody>
                  </table>
                  <p>Les prix sont affichés en euros (€) toutes taxes comprises. VoyYacht se réserve le droit de modifier ses tarifs à tout moment, sans que cela n'affecte les réservations déjà confirmées.</p>
                  <h4>Frais de nettoyage</h4>
                  <p>Des frais de nettoyage sont systématiquement ajoutés au montant de chaque réservation. Ces frais sont définis par chaque Annonceur et affichés clairement avant toute confirmation de réservation.</p>
                </div>
              </div>

              <div className="doc-section" id="cgu-6">
                <div className="doc-section-header">
                  <div className="doc-section-num">06</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Annulation</span>
                    <div className="doc-section-title">Politique d'annulation & remboursements</div>
                  </div>
                </div>
                <div className="prose">
                  <p>La politique d'annulation applicable à chaque réservation est définie par l'Annonceur parmi les trois options suivantes :</p>
                  <table className="legal-table">
                    <thead><tr><th>Politique</th><th>Conditions</th></tr></thead>
                    <tbody>
                      <tr><td><strong>Flexible</strong></td><td>Remboursement intégral si annulation plus de 14 jours avant la date de départ</td></tr>
                      <tr><td><strong>Modérée</strong></td><td>Remboursement de 50% si annulation plus de 7 jours avant la date de départ</td></tr>
                      <tr><td><strong>Stricte</strong></td><td>Non remboursable à partir de 48h avant le départ</td></tr>
                    </tbody>
                  </table>
                  <p>Toute demande d'annulation doit être adressée par écrit à l'équipe VoyYacht via le formulaire de contact ou par email à <Link href="mailto:contact@voyyacht.com">contact@voyyacht.com</Link> ou en cliquant sur le bouton d'annulation depuis l'espace client. Les remboursements sont traités dans un délai de 3 à 10 jours ouvrés selon le mode de paiement utilisé.</p>
                  <div className="info-box navy">
                    En cas de force majeure dûment justifiée (catastrophe naturelle, maladie grave, décès d'un proche au premier degré), VoyYacht se réserve le droit d'appliquer des conditions d'annulation plus favorables, à sa seule discrétion.
                  </div>
                </div>
              </div>

              <div className="doc-section" id="cgu-7">
                <div className="doc-section-header">
                  <div className="doc-section-num">07</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Responsabilités</span>
                    <div className="doc-section-title">Responsabilités & garanties</div>
                  </div>
                </div>
                <div className="prose">
                  <p>VoyYacht agit en qualité d'intermédiaire entre les Annonceurs et les Clients. La responsabilité d'VoyYacht est strictement limitée à son rôle de plateforme de mise en relation.</p>
                  <h4>Responsabilité de l'Annonceur</h4>
                  <p>L'Annonceur est seul responsable de la conformité du yacht avec la réglementation maritime applicable, de son état général, de sa navigabilité et de la fourniture des services décrits dans son annonce. L'Annonceur garantit disposer de toutes les assurances nécessaires couvrant la location à des tiers.</p>
                  <h4>Responsabilité du Client</h4>
                  <p>Le Client est responsable du bon usage du yacht, du respect des règles de navigation, du nombre maximal de personnes à bord et du comportement de ses invités. Tout dommage causé au yacht par le Client ou ses invités engage sa responsabilité.</p>
                  <h4>Limitation de responsabilité d'VoyYacht</h4>
                  <p>VoyYacht ne pourra être tenu responsable des dommages indirects résultant de l'utilisation de la Plateforme, ni des agissements des Annonceurs ou des Clients. La responsabilité maximale d'VoyYacht est limitée au montant de la commission perçue sur la réservation concernée.</p>
                </div>
              </div>

              <div className="doc-section" id="cgu-8">
                <div className="doc-section-header">
                  <div className="doc-section-num">08</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Droit applicable</span>
                    <div className="doc-section-title">Droit applicable & litiges</div>
                  </div>
                </div>
                <div className="prose">
                  <p>Les présentes CGU sont soumises au droit français. En cas de litige relatif à leur interprétation ou à leur exécution, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours. À défaut, le litige sera soumis à la compétence exclusive des tribunaux français.</p>
                  <p>Pour toute réclamation, vous pouvez contacter notre service client à <Link href="mailto:contact@voyyacht.com">contact@voyyacht.com</Link> ou via notre <Link href="/contact">formulaire de contact</Link>. Nous nous engageons à répondre dans un délai de 5 jours ouvrés.</p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ MENTIONS LÉGALES ══════════ */}
          {activeTab === 'mentions' && (
            <div className="tab-content active">
              <div className="doc-section" id="ml-1">
                <div className="doc-section-header">
                  <div className="doc-section-num">01</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Éditeur</span>
                    <div className="doc-section-title">Identification de l'éditeur</div>
                  </div>
                </div>
                <div className="prose">
                  <table className="legal-table">
                    <tbody>
                      <tr><td><strong>Raison sociale</strong></td><td>KEDYEM SAS</td></tr>
                      <tr><td><strong>Forme juridique</strong></td><td>Société par Actions Simplifiée (SAS)</td></tr>
                      <tr><td><strong>Numéro SIREN / SIRET</strong></td><td>913 031 241 / 913 031 241 00015</td></tr>
                      <tr><td><strong>Date d'immatriculation</strong></td><td>08/03/2022</td></tr>
                      <tr><td><strong>Siège social</strong></td><td>381 CHEMIN DES CARRIERES, LA CIOTAT, 13600</td></tr>
                      <tr><td><strong>Téléphone</strong></td><td>+33 1 42 00 00 00</td></tr>
                      <tr><td><strong>Email</strong></td><td>contact@voyyacht.com</td></tr>
                      <tr><td><strong>Directeur de la publication</strong></td><td>Laurent Rodolphe BREYTON, Président</td></tr>
                      <tr><td><strong>Numéro de TVA intracommunautaire</strong></td><td>FR72913031241</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-section" id="ml-2">
                <div className="doc-section-header">
                  <div className="doc-section-num">02</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Hébergement</span>
                    <div className="doc-section-title">Hébergeur du site</div>
                  </div>
                </div>
                <div className="prose">
                  <table className="legal-table">
                    <tbody>
                      <tr><td><strong>Hébergeur</strong></td><td>Vercel Inc.</td></tr>
                      <tr><td><strong>Adresse</strong></td><td>340 Pine Street, Suite 1200, San Francisco, CA 94104, États-Unis</td></tr>
                      <tr><td><strong>Site web</strong></td><td><Link href="https://www.vercel.com">www.vercel.com</Link></td></tr>
                      <tr><td><strong>Base de données</strong></td><td>Supabase (PostgreSQL — Serveurs EU)</td></tr>
                      <tr><td><strong>Stockage médias</strong></td><td>Cloudinary (Serveurs EU)</td></tr>
                      <tr><td><strong>Paiement</strong></td><td>Stripe Inc. (certifié PCI-DSS niveau 1) & PayPal Holdings Inc.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-section" id="ml-3">
                <div className="doc-section-header">
                  <div className="doc-section-num">03</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Propriété intellectuelle</span>
                    <div className="doc-section-title">Droits & propriété intellectuelle</div>
                  </div>
                </div>
                <div className="prose">
                  <p>L'ensemble des éléments constituant le site VoyYacht (textes, images, graphismes, logo, icônes, sons, logiciels, mise en page, base de données) sont la propriété exclusive de KEDYEM SAS ou font l'objet d'une licence d'utilisation accordée à KEDYEM SAS.</p>
                  <p>Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit et sur quelque support que ce soit, est interdite sans l'autorisation expresse et préalable de KEDYEM SAS.</p>
                  <h4>Contenu des utilisateurs</h4>
                  <p>En publiant du contenu (photos, textes, avis) sur la Plateforme, les utilisateurs accordent à VoyYacht une licence non exclusive, mondiale, gratuite et transférable, aux fins de l'exploitation de la Plateforme. Les utilisateurs garantissent disposer de tous les droits nécessaires sur le contenu publié.</p>
                </div>
              </div>

              <div className="doc-section" id="ml-4">
                <div className="doc-section-header">
                  <div className="doc-section-num">04</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Liens</span>
                    <div className="doc-section-title">Liens hypertextes</div>
                  </div>
                </div>
                <div className="prose">
                  <p>La création de liens hypertextes pointant vers le site VoyYacht est autorisée sans demande d'autorisation préalable, sous réserve que ces liens ne soient pas créés à des fins commerciales ou publicitaires et qu'ils n'induisent pas en erreur sur la nature, la qualité ou l'identité des services proposés par VoyYacht.</p>
                  <p>VoyYacht décline toute responsabilité quant au contenu des sites tiers accessibles via des liens présents sur la Plateforme.</p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ CONFIDENTIALITÉ ══════════ */}
          {activeTab === 'confidentialite' && (
            <div className="tab-content active">
              <div className="info-box gold" style={{ marginBottom: '2rem' }}>
                🔒 VoyYacht traite vos données personnelles dans le strict respect du Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) et de la législation française applicable.
              </div>

              <div className="doc-section" id="rgpd-1">
                <div className="doc-section-header">
                  <div className="doc-section-num">01</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Responsable</span>
                    <div className="doc-section-title">Responsable du traitement</div>
                  </div>
                </div>
                <div className="prose">
                  <p>Le responsable du traitement des données personnelles collectées sur la Plateforme est la société <strong>KEDYEM SAS</strong>, représentée par son Président, Laurent Rodolphe BREYTON. Pour toute question relative à la protection de vos données, vous pouvez contacter notre Délégué à la Protection des Données (DPO) à l'adresse : <Link href="mailto:dpo@voyyacht.com">dpo@voyyacht.com</Link>.</p>
                </div>
              </div>

              <div className="doc-section" id="rgpd-2">
                <div className="doc-section-header">
                  <div className="doc-section-num">02</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Données collectées</span>
                    <div className="doc-section-title">Données collectées & finalités</div>
                  </div>
                </div>
                <div className="prose">
                  <table className="legal-table">
                    <thead><tr><th>Données collectées</th><th>Finalité</th><th>Base légale</th></tr></thead>
                    <tbody>
                      <tr><td>Nom, prénom, email, téléphone</td><td>Création et gestion du compte</td><td>Exécution du contrat</td></tr>
                      <tr><td>Adresse postale, pays</td><td>Facturation et livraison</td><td>Exécution du contrat</td></tr>
                      <tr><td>Données de paiement</td><td>Traitement des transactions (via Stripe/PayPal)</td><td>Exécution du contrat</td></tr>
                      <tr><td>Vidéo selfie (Annonceurs)</td><td>Vérification d'identité</td><td>Obligation légale / Consentement</td></tr>
                      <tr><td>Photos de yachts</td><td>Publication des annonces</td><td>Exécution du contrat</td></tr>
                      <tr><td>Avis et messages</td><td>Fonctionnement de la plateforme</td><td>Intérêt légitime</td></tr>
                      <tr><td>Données de navigation, IP</td><td>Sécurité, analytics</td><td>Intérêt légitime / Consentement</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-section" id="rgpd-3">
                <div className="doc-section-header">
                  <div className="doc-section-num">03</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Durée</span>
                    <div className="doc-section-title">Durée de conservation</div>
                  </div>
                </div>
                <div className="prose">
                  <ul>
                    <li>Données de compte : durée de l'utilisation du compte + 3 ans après désactivation</li>
                    <li>Données de réservation et de paiement : 10 ans (obligations comptables)</li>
                    <li>Vidéos de vérification d'identité : 5 ans après la dernière annonce active</li>
                    <li>Avis et messages : durée de l'utilisation du compte</li>
                    <li>Données de navigation : 13 mois maximum</li>
                  </ul>
                </div>
              </div>

              <div className="doc-section" id="rgpd-4">
                <div className="doc-section-header">
                  <div className="doc-section-num">04</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Vos droits</span>
                    <div className="doc-section-title">Vos droits RGPD</div>
                  </div>
                </div>
                <div className="prose">
                  <p>Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :</p>
                  <ul>
                    <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles ;</li>
                    <li><strong>Droit de rectification :</strong> corriger des données inexactes ;</li>
                    <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données ("droit à l'oubli") ;</li>
                    <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré ;</li>
                    <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données pour raisons légitimes ;</li>
                    <li><strong>Droit à la limitation :</strong> demander la suspension du traitement de vos données.</li>
                  </ul>
                  <p>Pour exercer ces droits, rendez-vous dans votre espace personnel (section "Activité du compte") ou contactez notre DPO à <Link href="mailto:dpo@voyyacht.com">dpo@voyyacht.com</Link>. Nous répondrons dans un délai maximum de 30 jours.</p>
                  <div className="info-box navy">
                    Vous disposez également du droit d'introduire une réclamation auprès de l'autorité de contrôle compétente. En France : la CNIL (www.cnil.fr).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ COOKIES ══════════ */}
          {activeTab === 'cookies' && (
            <div className="tab-content active">
              <div className="doc-section" id="ck-1">
                <div className="doc-section-header">
                  <div className="doc-section-num">01</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Définition</span>
                    <div className="doc-section-title">Qu'est-ce qu'un cookie ?</div>
                  </div>
                </div>
                <div className="prose">
                  <p>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d'un site web. Les cookies permettent au site de mémoriser vos préférences, d'améliorer votre expérience de navigation et de réaliser des statistiques d'audience.</p>
                </div>
              </div>

              <div className="doc-section" id="ck-2">
                <div className="doc-section-header">
                  <div className="doc-section-num">02</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Types de cookies</span>
                    <div className="doc-section-title">Cookies utilisés sur la Plateforme</div>
                  </div>
                </div>
                <div className="prose">
                  <table className="legal-table">
                    <thead><tr><th>Type</th><th>Finalité</th><th>Durée</th><th>Consentement</th></tr></thead>
                    <tbody>
                      <tr><td><strong>Essentiels</strong></td><td>Authentification, session, sécurité CSRF</td><td>Session</td><td>Non requis</td></tr>
                      <tr><td><strong>Fonctionnels</strong></td><td>Mémorisation des préférences (langue, filtres)</td><td>1 an</td><td>Non requis</td></tr>
                      <tr><td><strong>Analytiques</strong></td><td>Statistiques d'audience anonymisées</td><td>13 mois</td><td>Requis</td></tr>
                      <tr><td><strong>Marketing</strong></td><td>Publicité ciblée (actuellement désactivé)</td><td>—</td><td>Requis</td></tr>
                      <tr><td><strong>Stripe/PayPal</strong></td><td>Sécurité des paiements (tiers)</td><td>Session</td><td>Non requis</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="doc-section" id="ck-3">
                <div className="doc-section-header">
                  <div className="doc-section-num">03</div>
                  <div className="doc-section-titles">
                    <span className="doc-section-eyebrow">Gestion</span>
                    <div className="doc-section-title">Gérer vos préférences</div>
                  </div>
                </div>
                <div className="prose">
                  <p>Vous pouvez à tout moment gérer vos préférences en matière de cookies :</p>
                  <ul>
                    <li>Depuis votre profil, section "Activité du compte" ;</li>
                    <li>Via les paramètres de votre navigateur (Internet Explorer, Firefox, Chrome, Safari, etc.) ;</li>
                    <li>Via les outils de gestion fournis par les tiers (Stripe, PayPal).</li>
                  </ul>
                  <p>La désactivation des cookies essentiels peut empêcher le bon fonctionnement de la Plateforme, notamment la connexion à votre compte et le processus de réservation.</p>
                  <div className="info-box gold">
                    VoyYacht n'affiche aucune publicité et ne commercialise pas les données de ses utilisateurs. Les cookies marketing sont actuellement désactivés sur l'ensemble de la Plateforme.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${showToast ? 'show' : ''}`}>
        <span id="toast-msg">{toastMsg}</span>
        <div className="toast-bar"></div>
      </div>
    </div>
  );
}
