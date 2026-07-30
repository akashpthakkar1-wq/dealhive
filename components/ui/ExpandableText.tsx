'use client'
import { useState, useRef, useEffect } from 'react'

export default function ExpandableText({ text, className = '' }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  // Detect whether the text actually overflows 2 lines (only then show "more")
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // When collapsed, scrollHeight > clientHeight means it's being clamped
    setIsClamped(el.scrollHeight > el.clientHeight + 2)
  }, [text])

  return (
    <div className={className}>
      <p
        ref={ref}
        className={`text-gray-500 text-sm leading-relaxed transition-all ${expanded ? '' : 'line-clamp-2'}`}>
        {text}
      </p>
      {(isClamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-primary-600 hover:text-primary-700 text-sm font-semibold mt-0.5">
          {expanded ? 'less' : 'more'}
        </button>
      )}
    </div>
  )
}
