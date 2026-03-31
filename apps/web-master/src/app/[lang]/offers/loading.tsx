/**
 * Offers Page Loading Skeleton
 * 
 * Provides a skeleton UI while the offers page loads.
 * Matches the layout structure of the actual offers page for a smooth transition.
 */
export default function OffersLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <div className="bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-10 bg-slate-200 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded-lg w-1/2 mx-auto animate-pulse" />
        </div>
      </div>

      {/* Offers Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-slate-200 rounded w-full mb-2" />
              <div className="h-4 bg-slate-200 rounded w-5/6 mb-4" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
