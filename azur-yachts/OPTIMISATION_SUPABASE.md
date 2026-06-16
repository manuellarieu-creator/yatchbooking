# Stratégie d'Optimisation Supabase (Free Tier) - VoyYacht

Ce document détaille les stratégies mises en place et à suivre pour maintenir le projet VoyYacht sur le plan gratuit de Supabase.

## 1. Stockage Fichiers (Images)
**Statut actuel : Optimal ✅**
*   **Constat :** Le projet utilise **Cloudinary** (`v2 as cloudinary`) pour le stockage et la livraison des images, et non Supabase Storage.
*   **Avantage :** Cela permet d'économiser totalement la limite de 1 Go de stockage et la limite de 5 Go de bande passante mensuelle imposées par le plan gratuit de Supabase.
*   **Action :** Continuer à utiliser Cloudinary pour tous les médias (yachts, destinations, avatars).

## 2. Connexions à la Base de Données
**Statut actuel : Optimal ✅**
*   **Constat :** Les variables d'environnement (`DATABASE_URL`) utilisent déjà le *Connection Pooler* de Supabase (`pooler.supabase.com:6543?pgbouncer=true`).
*   **Avantage :** Dans un environnement Serverless comme Next.js (où chaque requête API peut créer une nouvelle connexion), le pooler empêche de saturer la limite de connexions simultanées de la base Postgres gratuite.
*   **Action :** Toujours utiliser le port `6543` avec `pgbouncer=true` pour `DATABASE_URL` et le port `5432` pour `DIRECT_URL`.

## 3. Empêcher la Pause Automatique (Keep-Alive)
**Statut actuel : À mettre en place ⏳**
*   **Constat :** Le plan gratuit de Supabase se met automatiquement en pause après 1 semaine d'inactivité (aucune requête).
*   **Stratégie :** Créer une route API dédiée (`/api/cron/keepalive`) qui effectue une requête très légère (ex: `SELECT 1`) sur la base de données.
*   **Action :** Configurer un service externe (comme Vercel Cron, GitHub Actions, ou cron-job.org) pour appeler cette route tous les 3 ou 4 jours.

## 4. Nettoyage de la Base de Données
**Statut actuel : À surveiller ⏳**
*   **Constat :** La limite de la base de données est de 500 Mo.
*   **Action :** Surveiller la taille de la base de données via le dashboard Supabase. Si elle approche des 400 Mo, il faudra prévoir des scripts pour purger les anciennes données (logs, sessions expirées, etc.).

## 5. Optimisation des Requêtes et Cache
**Statut actuel : En continu ⏳**
*   **Action :** Continuer d'utiliser les fonctionnalités de cache de Next.js pour limiter les appels directs à Supabase. Éviter d'utiliser Supabase Realtime si ce n'est pas strictement nécessaire.
