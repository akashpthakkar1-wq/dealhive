export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Hero band skeleton */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-7 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-12 w-24 bg-gray-200 rounded-xl" />
                <div className="h-12 w-24 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon cards skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
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
