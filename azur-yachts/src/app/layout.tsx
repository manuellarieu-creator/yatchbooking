import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import HeaderVisibility from "@/components/layout/HeaderVisibility";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { db as prisma } from "@/lib/db";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Azur Yachts — Location de Luxe",
  description: "Des expériences nautiques d'exception sur les plus belles eaux du monde.",
};

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
          <HeaderVisibility>
            <Header />
          </HeaderVisibility>
          {children}
        </MaintenanceGuard>
      </body>
    </html>
  );
}
