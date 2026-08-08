export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Heading skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />

        {/* Coupon cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-28">
              <div className="w-24 bg-gray-100 flex-shrink-0 border-r-2 border-dotted border-gray-200" />
              <div className="flex-1 p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
