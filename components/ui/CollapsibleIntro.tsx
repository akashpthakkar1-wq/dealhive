'use client'
import { useState } from 'react'

export default function CollapsibleIntro() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="text-sm text-gray-500 leading-relaxed">
      <p className={expanded ? '' : 'line-clamp-3'}>
        Welcome to <strong>EndOverPay</strong> — your trusted source for verified <strong>coupon codes</strong>, <strong>promo codes</strong>, <strong>voucher codes</strong> and <strong>discount codes</strong> from hundreds of top online stores worldwide. We manually verify every deal before publishing so you never waste time on expired codes. From fashion and electronics to food delivery and travel, find the best deals updated across all categories. Stop overpaying — start saving smarter with EndOverPay.
      </p>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-primary-600 hover:text-primary-700 font-semibold text-sm mt-1">
        {expanded ? 'less' : '…more'}
      </button>
    </div>
  )
}
