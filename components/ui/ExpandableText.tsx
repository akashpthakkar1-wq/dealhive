'use client'
import { useState, useRef, useEffect } from 'react'

export default function ExpandableText({ text, className = '' }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setIsClamped(el.scrollHeight > el.clientHeight + 2)
  }, [text])

  return (
    <div className={className}>
      <p
        ref={ref}
        className={`text-gray-500 text-sm leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
        {text}
        {expanded && isClamped && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-primary-600 hover:text-primary-700 font-semibold ml-1">
            less
          </button>
        )}
      </p>
      {!expanded && isClamped && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-primary-600 hover:text-primary-700 text-sm font-semibold -mt-5 float-right bg-gray-100 pl-1 relative z-10">
          …more
        </button>
      )}
    </div>
  )
}
