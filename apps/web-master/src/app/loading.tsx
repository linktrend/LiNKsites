/**
 * Global Loading State
 * 
 * Displayed while the app is loading at the root level.
 * This provides a consistent loading experience across the entire application.
 * 
 * Uses design tokens for consistent styling with the rest of the application.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {/* Animated Spinner */}
        <div className="mb-4 flex justify-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
        
        {/* Loading Text */}
        <p className="text-slate-600 text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
}
