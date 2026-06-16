import { db as prisma } from '@/lib/db';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

// ============================================================================
// 1. DÉDUPLICATION PAR REQUÊTE (React Cache)
// Utilise cache() pour éviter que plusieurs composants sur la même page
// ne fassent la même requête SQL au même moment.
// ============================================================================

export const getListingById = cache(async (id: string) => {
  return await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      owner: { select: { id: true, firstName: true, avatar: true } }
    }
  });
});

export const getUserById = cache(async (id: string) => {
  return await prisma.user.findUnique({
    where: { id }
  });
});

// ============================================================================
// 2. CACHING DE DONNÉES STATIQUES (Next.js unstable_cache)
// Met en cache les données en mémoire/sur le serveur pour tous les visiteurs.
// La base de données n'est interrogée que lors du revalidate (ex: 1 heure).
// ============================================================================

export const getCachedDestinations = unstable_cache(
  async () => {
    return await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  },
  ['destinations-list'], // Clé de cache
  { 
    revalidate: 3600, // Revalide toutes les heures (3600 secondes)
    tags: ['destinations'] 
  }
);

export const getCachedFAQs = unstable_cache(
  async () => {
    return await prisma.fAQ.findMany({
      orderBy: { order: 'asc' }
    });
  },
  ['faq-list'],
  { 
    revalidate: 86400, // Revalide tous les jours (86400 secondes)
    tags: ['faqs'] 
  }
);

export const getCachedPlatformSettings = unstable_cache(
  async () => {
    return await prisma.platformSettings.findUnique({
      where: { id: 'default' }
    });
  },
  ['platform-settings'],
  {
    revalidate: 3600,
    tags: ['settings']
  }
);
