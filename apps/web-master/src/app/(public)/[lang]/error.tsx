'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            This page could not be displayed.
          </h2>
          <p className="text-muted-foreground">
            Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
