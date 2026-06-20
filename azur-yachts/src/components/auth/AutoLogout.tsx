'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function AutoLogout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const TIMEOUT_MS = 7 * 60 * 1000; // 7 minutes

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Inactivity timeout reached, logout
      signOut({ callbackUrl: '/login?expired=true' });
    }, TIMEOUT_MS);
  };

  useEffect(() => {
    // Start the timer
    resetTimer();

    // Listen to user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach((e) => window.addEventListener(e, handleActivity));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [pathname]); // Also reset on navigation

  return null;
}
