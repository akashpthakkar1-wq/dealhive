'use client'

import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

export default function LiveSavingCount() {
  const [count, setCount] = useState('1,240')

  useEffect(() => {
    // Generate realistic number between 800-2,400 on client
    // Changes every 30 seconds to feel live
    function generate() {
      const base = 800
      const variance = Math.floor(Math.random() * 1600)
      setCount((base + variance).toLocaleString())
    }
    generate()
    const interval = setInterval(generate, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 border border-white/20">
      <Zap className="w-3.5 h-3.5 text-[#FED7AA]" />
      {count} people saving right now
    </div>
  )
}
