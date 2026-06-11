'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function HeaderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/publish') ||
    searchParams.get('modal') === 'true'
  ) {
    return null;
  }

  return <>{children}</>;
}

export default function HeaderVisibility({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <HeaderContent>{children}</HeaderContent>
    </Suspense>
  );
}
