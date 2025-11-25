'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * Hook that safely uses useSession while handling SSR/build-time contexts
 * where session data is unavailable.
 */
export function useSafeSession(options?: any) {
  const [isClient, setIsClient] = useState(false);
  const sessionResult = useSession(options);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return a safe version that won't break during SSR/build
  if (!isClient) {
    return {
      data: null,
      status: 'loading' as const,
      update: async () => undefined,
    };
  }

  return sessionResult;
}
