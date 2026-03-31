import Link from 'next/link';

/**
 * Global 404 Not Found Page
 * 
 * Displayed when a user navigates to a route that doesn't exist.
 * This is a fallback page that doesn't rely on i18n context since it may
 * be rendered outside the normal layout hierarchy.
 * 
 * Note: This is a Server Component. For client-side navigation errors,
 * the error.tsx boundary will be used instead.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-slate-50">
          <div className="max-w-md w-full text-center">
            {/* 404 Illustration */}
            <div className="mb-6">
              <div className="text-8xl font-bold text-slate-200 mb-2">404</div>
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Page Not Found
            </h1>

            {/* Error Description */}
            <p className="text-slate-600 mb-8">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/en"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
