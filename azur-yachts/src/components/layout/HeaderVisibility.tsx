'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function HeaderContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  // If modal, always hide
  if (searchParams.get('modal') === 'true') {
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
