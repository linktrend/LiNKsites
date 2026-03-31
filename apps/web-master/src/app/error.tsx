'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-800">Something went wrong!</h2>
            <p className="mb-8 text-slate-600">We apologize for the inconvenience.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => reset()}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Try again
              </button>
              <a
                href="/"
                className="rounded bg-slate-200 px-4 py-2 text-slate-800 hover:bg-slate-300"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
