'use client';

import { usePathname } from 'next/navigation';

// Simplified hook for marketing site (no locale support)
export function useLocalePath() {
  const pathname = usePathname();
  
  return {
    buildPath: (path: string) => path,
    pathname: pathname || '/',
  };
}
