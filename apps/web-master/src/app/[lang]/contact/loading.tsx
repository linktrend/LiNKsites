/**
 * Contact Page Loading Skeleton
 * 
 * Provides a skeleton UI while the contact page loads.
 * Matches the layout structure of the actual contact page.
 */
export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <div className="bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-10 bg-slate-200 rounded-lg w-1/2 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded-lg w-2/3 mx-auto animate-pulse" />
        </div>
      </div>

      {/* Contact Form Skeleton */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-6 animate-pulse">
          <div className="h-12 bg-slate-200 rounded-lg w-full" />
          <div className="h-12 bg-slate-200 rounded-lg w-full" />
          <div className="h-32 bg-slate-200 rounded-lg w-full" />
          <div className="h-12 bg-slate-200 rounded-lg w-1/3" />
        </div>
      </div>

      {/* Contact Channels Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
