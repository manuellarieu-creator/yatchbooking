# 🚤 Azur Yachts - Récapitulatif Global du Projet

*Date de mise à jour : 13 Juin 2026*

Ce document synthétise l'état actuel du projet **Azur Yachts** (YachtBooking), ce qui a été implémenté et les tâches restantes ou points d'attention avant un lancement en production.

---

## 🛠️ Stack Technique & Architecture
- **Frontend / Framework** : Next.js 14 (App Router), React 18
- **Styling & UI** : Tailwind CSS, Shadcn UI, Radix UI, Framer Motion
- **Backend & BDD** : Prisma ORM, PostgreSQL (via `@prisma/adapter-pg`)
- **Authentification** : NextAuth (v5 beta) avec JWT, OTP, 2FA (Email/SMS)
- **Paiements** : Stripe (Intents & Webhooks), Virements bancaires gérés manuellement
- **Emails & Notifications** : Resend (Emails), Web-Push, Twilio (SMS)
- **Stockage Médias** : Cloudinary (Images, Selfies vidéo, Pièces d'identité)
- **Temps Réel** : Socket.io (Messagerie instantanée)

---

## ✅ Ce qui est DÉJÀ FAIT (Fonctionnalités Implémentées)

### 1. Authentification & Sécurité (Users)
- Inscription et Connexion (Rôles : `CLIENT`, `ADVERTISER`, `ADMIN`).
- Vérification d'email et réinitialisation de mot de passe.
- Système **KYC** avancé : upload de pièces d'identité (recto/verso) et vérification par vidéo selfie.
- Authentification à double facteur (2FA) par Email et SMS.
- Gestion des sessions et des appareils connectés.

### 2. Espace Annonces (Listings / Yachts)
- Pages publiques de recherche (`/yachts`) et de détails (`/yacht/[id]`).
- Publication par les annonceurs (`/publish`) avec gestion des caractéristiques techniques (longueur, année, cabines).
- Gestion fine des prix : prix de base, caution, frais de nettoyage, frais de livraison, services additionnels.
- Gestion des disponibilités (Availabilities).

### 3. Réservations (Bookings)
- Tunnel de réservation avec sélection de dates, calcul des frais totaux, gestion des enfants/adultes.
- Demandes de modifications de réservations.
- Suivi du statut de la réservation (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).

### 4. Paiements & Facturation
- Intégration **Stripe** (Paiement par CB, Webhooks pour confirmation auto).
- Intégration des **Virements Bancaires** (Upload d'une preuve de virement par le client).
- Page sécurisée de paiement propre à la réservation.

### 5. Messagerie inter-utilisateurs & Notifications
- Système de **Conversations** (Chat en temps réel ou asynchrone).
- Notifications In-App et Web-Push pour différents événements (nouvelle résa, nouveau message, approbation).

### 6. Backoffice Administration (`/admin/*`)
- Tableau de bord avec statistiques (Dashboard).
- Validation KYC des utilisateurs et approbation/rejet des comptes.
- Gestion des annonces (Approbation des nouveaux yachts).
- Validation des paiements (notamment virements bancaires).
- Gestion dynamique des Destinations de la page d'accueil.
- Gestion des Avis (Reviews), de la Blacklist, de la Newsletter.
- Interface de paramétrage général (Réglages Plateforme, Activer/Désactiver Stripe ou Virements).

### 7. Autres
- Système d'Avis (Reviews) sur les yachts, les propriétaires ou le site global.
- Système de Favoris.
- Pages de Contenu (FAQ, À propos, Mentions légales).

### 8. Améliorations UI / UX (Récentes)
- Header conditionnel : "Navy Dashboard Header" (bleu marine) exclusif sur Desktop pour les connectés, et Header Classique (blanc avec menu hamburger) sur Mobile et pour les invités.
- Ajout de la soumission du formulaire de connexion via la touche "Entrée".
- Refonte et centralisation de la Sidebar Desktop pour le Dashboard, Favoris et Réservations.
- Support du SEO de base (balises dynamiques, Sitemap dynamique et Robots.txt).

---

## 🔴 Ce qu'il RESTE À FAIRE (Tâches & Points de Vigilance)

### Finalisations Techniques & Profil
- [x] **Notifications (Préférences)** : Les préférences de notifications sauvegardées dans le profil conditionnent désormais l'envoi effectif des emails et push (logique opt-out via `shouldNotify()`).
- [x] **Activités du compte (Profil)** : Historique d'activité désormais entièrement dynamique — réservations (création + changement de statut), annonces, connexions, avis, paiements et favoris.
- [x] **Zone Sensible → Clôture de compte** : Section renommée « Clôturer mon compte », libellés et descriptions améliorés, modal de confirmation mis à jour.
- [x] **Paiement par Virement** : Textes clarifiés sur les 2 pages de paiement — encart « confirmation non immédiate » ajouté dès la sélection, rappels renforcés dans les instructions et l'écran de succès.
- [x] **Modifications de Réservations** : Le flux est terminé : une demande de modification par le client envoie désormais une notification in-app et push aux Admins.
- [x] **Temps Réel** : Implémentation d'un serveur personnalisé (`server.js`) avec Socket.io adapté pour un déploiement VPS. Remplacement du polling par des événements WebSocket dans la messagerie et les notifications in-app.

### Préparation à la Production (DevOps & Configuration)
- [ ] **Domaine et Emails** : Valider le domaine de production sur **Resend**.
- [ ] **Stripe (Live)** : Passer les clés Stripe en mode "Live" et configurer l'URL exacte du Webhook de production.
- [ ] **Twilio (Live)** : S'assurer que le compte Twilio est provisionné pour l'envoi de SMS en volume pour le 2FA.
- [ ] **Cloudinary** : Vérifier les limites de stockage et la politique de rétention (KYC).
- [ ] **Base de Données** : S'assurer que les sauvegardes automatisées (Backups) sont activées.

### Expérience Utilisateur & Tests
- [ ] **Tests de bout-en-bout (E2E)** : Faire un test grandeur nature du tunnel complet en condition réelle : `Création Annonceur -> KYC -> Validation Admin -> Dépôt Annonce -> Inscription Client -> Réservation -> Paiement -> Validation`.
