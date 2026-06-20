import type { Metadata } from "next";
import { Suspense } from 'react';
import "./globals.css";
import Header from "@/components/layout/Header";
import HeaderVisibility from "@/components/layout/HeaderVisibility";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { db as prisma } from "@/lib/db";
import { auth } from "@/auth";
import GlobalMobileNav from "@/components/layout/GlobalMobileNav";
import "@/components/layout/GlobalMobileNav.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://azuryachts.vercel.app'
  ),
  title: {
    default: 'VoyYacht — Location de yachts de prestige',
    template: '%s — VoyYacht',
  },
  description: 'La plateforme de référence pour la location de yachts de luxe. 340+ yachts vérifiés, 68 destinations, annonceurs certifiés.',
  keywords: ['location yacht', 'yacht luxe', 'charter yacht', 'voilier location', 'catamaran location'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'VoyYacht',
  },
};

import BackToTop from "@/components/layout/BackToTop";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
  const session = await auth();
  const isAdmin = session?.user && (session.user as any).role === 'ADMIN';
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <MaintenanceGuard isMaintenance={!!settings?.maintenanceMode} isAdmin={!!isAdmin}>
          <HeaderVisibility isLoggedIn={!!session?.user}>
            <Header />
          </HeaderVisibility>
          {session?.user && (
            <Suspense fallback={null}>
              <GlobalMobileNav />
            </Suspense>
          )}
          {children}
          <BackToTop />
        </MaintenanceGuard>
      </body>
    </html>
  );
}
