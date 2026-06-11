import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard') || 
                               nextUrl.pathname.startsWith('/profile') || 
                               nextUrl.pathname.startsWith('/reservations') ||
                               nextUrl.pathname.startsWith('/admin');
                               
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
