'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

interface Props {
  storeId: string
  storeName: string
  initialCount: number
  initialAverage: number   // already computed avg (rating_sum/rating_count), or 0
}

const THRESHOLD = 3  // only show the public rating once we have >= 3 real votes

export default function StoreRating({ storeId, storeName, initialCount, initialAverage }: Props) {
  const [count, setCount] = useState(initialCount)
  const [average, setAverage] = useState(initialAverage)
  const [hovered, setHovered] = useState(0)
  const [voted, setVoted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Check localStorage guard on mount
  useEffect(() => {
    try {
      if (localStorage.getItem(`rated_store_${storeId}`)) setVoted(true)
    } catch {}
  }, [storeId])

  async function submitRating(stars: number) {
    if (voted || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/rate-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, stars }),
      })
      const data = await res.json()
      if (data?.ok) {
        if (typeof data.ratingCount === 'number') setCount(data.ratingCount)
        if (typeof data.average === 'number') setAverage(data.average)
        setVoted(true)
        try { localStorage.setItem(`rated_store_${storeId}`, String(stars)) } catch {}
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false)
    }
  }

  const showPublicRating = count >= THRESHOLD

  return (
    <div className="py-5">
      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
        {showPublicRating ? `${storeName} Rating` : 'Rate This Store'}
      </h3>

      {/* Public average — only when >= THRESHOLD real votes */}
      {showPublicRating && (
        <div className="mb-4">
          <div className="text-5xl font-extrabold text-gray-900 mb-1">{average.toFixed(1)}</div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            from {count} {count === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
      )}

      {/* Interactive vote row */}
      {voted ? (
        <p className="text-sm text-green-600 font-medium">
          Thanks for rating {storeName}!
        </p>
      ) : (
        <div>
          <p className="text-xs text-gray-500 mb-2">
            {showPublicRating
              ? `Did these ${storeName} coupons work for you?`
              : `Be the first to rate these ${storeName} coupons`}
          </p>
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                disabled={submitting}
                onMouseEnter={() => setHovered(s)}
                onClick={() => submitRating(s)}
                aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
                className="p-0.5 disabled:opacity-50 transition-transform active:scale-90"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    s <= hovered ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-100'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
