import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Configurer le middleware pour s'exécuter sur toutes les routes SAUF les fichiers statiques et images
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
