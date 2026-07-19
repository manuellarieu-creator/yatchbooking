'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function AutoLogout() {
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const TIMEOUT_MS = 7 * 60 * 1000; // 7 minutes

  useEffect(() => {
    lastActivityRef.current = Date.now();

    const checkInactivity = () => {
      if (Date.now() - lastActivityRef.current > TIMEOUT_MS) {
        signOut({ callbackUrl: '/?expired=true' });
      }
    };

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Use capture: true to ensure we catch events even if child components call stopPropagation()
    events.forEach((e) => window.addEventListener(e, handleActivity, { capture: true }));

    // Check inactivity every 10 seconds instead of resetting a timer on every mouse movement
    timeoutRef.current = setInterval(checkInactivity, 10000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity, { capture: true }));
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [pathname]);

  return null;
}
