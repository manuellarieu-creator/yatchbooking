'use client';

import { usePathname } from 'next/navigation';

export default function HeaderVisibility({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // On masque le header global sur le tableau de bord annonceur et l'espace admin
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  return <>{children}</>;
}
