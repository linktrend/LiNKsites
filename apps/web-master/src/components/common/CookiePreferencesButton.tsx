'use client';

import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

interface CookiePreferencesButtonProps {
  children: ReactNode;
}

/**
 * Cookie Preferences Button
 * 
 * Client component that triggers the cookie preferences modal.
 * Must be a client component to use onClick handlers.
 */
export function CookiePreferencesButton({ children }: CookiePreferencesButtonProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openCookieModal'));
    }
  };

  return (
    <Button onClick={handleClick} variant="default" size="default">
      {children}
    </Button>
  );
}
