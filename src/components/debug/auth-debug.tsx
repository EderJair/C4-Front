// src/components/debug/auth-debug.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';

export default function AuthDebug() {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
    </div>
  );
}
