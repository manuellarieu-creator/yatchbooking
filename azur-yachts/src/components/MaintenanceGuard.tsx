'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function MaintenanceGuard({ 
  isMaintenance, 
  isAdmin, 
  children 
}: { 
  isMaintenance: boolean; 
  isAdmin: boolean; 
  children: ReactNode 
}) {
  const pathname = usePathname() || '';

  // Always allow access to login page so admins can authenticate
  if (isMaintenance && !isAdmin && !pathname.startsWith('/auth') && !pathname.startsWith('/api/auth')) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#0a2040', color: '#fff', textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-sans), sans-serif'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--gold, #b8985a)', fontFamily: 'var(--font-serif), serif' }}>Site en maintenance</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '600px', lineHeight: 1.6 }}>
          Nous effectuons actuellement une mise à jour de notre plateforme pour vous offrir une meilleure expérience. 
          Veuillez repasser d'ici quelques minutes.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
