'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function HeaderContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // If modal or admin layout, always hide
  if (searchParams.get('modal') === 'true' || pathname?.startsWith('/admin')) {
    return null;
  }

  return <>{children}</>;
}

export default function HeaderVisibility({ children, isLoggedIn }: { children: React.ReactNode, isLoggedIn?: boolean }) {
  return (
    <Suspense fallback={null}>
      <HeaderContent>{children}</HeaderContent>
    </Suspense>
  );
}
