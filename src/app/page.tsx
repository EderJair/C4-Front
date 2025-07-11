// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirigir según el rol
        switch (user.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'ingeniero':
            router.push('/ingeniero');
            break;
          case 'trabajador':
            router.push('/trabajador');
            break;
          default:
            router.push('/admin');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}