import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || 
                               nextUrl.pathname.startsWith('/profile') || 
                               nextUrl.pathname.startsWith('/reservations');
                               
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirige vers la page de connexion
      } else if (isLoggedIn && nextUrl.pathname === '/auth') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // On ajoutera les providers dans auth.ts
} satisfies NextAuthConfig;
