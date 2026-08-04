'use client'
import { useState, useRef, useEffect } from 'react'

export default function CollapsibleIntro() {
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setIsClamped(el.scrollHeight > el.clientHeight + 2)
  }, [])

  return (
    <div className="text-sm text-gray-500 leading-relaxed relative">
      <p ref={ref} className={expanded ? '' : 'line-clamp-3'}>
        Welcome to <strong>EndOverPay</strong> — your trusted source for verified <strong>coupon codes</strong>, <strong>promo codes</strong>, <strong>voucher codes</strong> and <strong>discount codes</strong> from hundreds of top online stores worldwide. We manually verify every deal before publishing so you never waste time on expired codes. From fashion and electronics to food delivery and travel, find the best deals updated across all categories. Stop overpaying — start saving smarter with EndOverPay.
        {expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-primary-600 hover:text-primary-700 font-semibold ml-1 whitespace-nowrap">
            less
          </button>
        )}
      </p>
      {!expanded && isClamped && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-primary-600 hover:text-primary-700 font-semibold text-sm absolute bottom-0 right-0 bg-white pl-1 shadow-[-8px_0_6px_-2px_rgba(255,255,255,1)]">
          …more
        </button>
      )}
    </div>
  )
}
