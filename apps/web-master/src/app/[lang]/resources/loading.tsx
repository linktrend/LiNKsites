/**
 * Resources Page Loading Skeleton
 * 
 * Provides a skeleton UI while the resources page loads.
 * Matches the layout structure of the actual resources page.
 */
export default function ResourcesLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <div className="bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-10 bg-slate-200 rounded-lg w-2/3 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded-lg w-1/2 mx-auto animate-pulse" />
        </div>
      </div>

      {/* Resource Categories Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-8 animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-6" />
              <div className="h-10 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
