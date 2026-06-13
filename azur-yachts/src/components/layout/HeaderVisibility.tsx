'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function HeaderContent({ children, isLoggedIn }: { children: React.ReactNode, isLoggedIn?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If modal, always hide
  if (searchParams.get('modal') === 'true') {
    return null;
  }

  if (isLoggedIn) {
    // Si connecté: Masquer sur la landing page "/", afficher partout ailleurs
    if (pathname === '/') {
      return null;
    }
    return <>{children}</>;
  } else {
    // Si non connecté: Afficher partout SAUF dashboard/admin/publish
    if (
      pathname?.startsWith('/dashboard') || 
      pathname?.startsWith('/admin') ||
      pathname?.startsWith('/publish')
    ) {
      return null;
    }
    return <>{children}</>;
  }
}

export default function HeaderVisibility({ children, isLoggedIn }: { children: React.ReactNode, isLoggedIn?: boolean }) {
  return (
    <Suspense fallback={null}>
      <HeaderContent isLoggedIn={isLoggedIn}>{children}</HeaderContent>
    </Suspense>
  );
}
