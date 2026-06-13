import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      if (trigger === 'update' && session?.user) {
        if (session.user.status) token.status = session.user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || 
                               nextUrl.pathname.startsWith('/profile') || 
                               nextUrl.pathname.startsWith('/reservations') ||
                               nextUrl.pathname.startsWith('/publish') ||
                               nextUrl.pathname.startsWith('/admin');
                               
      if (isProtectedRoute) {
        if (!isLoggedIn) return false; // Redirige vers la page de connexion
        
        const role = (auth.user as any).role;
        const status = (auth.user as any).status;

        // Bloquer l'accès à /publish pour les clients
        if (nextUrl.pathname.startsWith('/publish') && role === 'CLIENT') {
          return Response.redirect(new URL('/profile', nextUrl));
        }

        // Bloquer l'accès au dashboard et /publish pour les annonceurs PENDING
        if ((nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/publish')) && role === 'ADVERTISER' && status === 'PENDING') {
          return Response.redirect(new URL('/verify', nextUrl));
        }

        return true;
      } else if (isLoggedIn && nextUrl.pathname === '/auth') {
        const role = (auth.user as any).role;
        const status = (auth.user as any).status;
        const redirectUrl = (role === 'ADVERTISER' && status === 'PENDING') ? '/verify' : (role === 'ADVERTISER' || role === 'ADMIN') ? '/dashboard' : '/profile';
        return Response.redirect(new URL(redirectUrl, nextUrl));
      }
      return true;
    },
  },
  providers: [], // On ajoutera les providers dans auth.ts
} satisfies NextAuthConfig;
