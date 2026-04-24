'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Coupon } from '@/types'

export default function DealOfTheDay({ coupon }: { coupon: Coupon }) {
  const [time, setTime] = useState({ h: '08', m: '00', s: '00' })

  useEffect(() => {
    // Count down to midnight
    function tick() {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000))
      const h = String(Math.floor(diff / 3600)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
      const s = String(diff % 60).padStart(2, '0')
      setTime({ h, m, s })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  function handleCTA() {
    const url = `${window.location.origin}/store/${coupon.store?.slug}?popup=${coupon.id}`
    window.open(url, '_blank')
    window.location.href = coupon.affiliate_url
  }

  return (
    <div className="bg-[#1C1917] rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Left */}
        <div className="flex-1 p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 bg-[#EA580C] text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1l1.2 2.8L10 4.2l-2 2 .5 2.8L6 7.8 3.5 9l.5-2.8-2-2 2.8-.4L6 1z" fill="white"/>
            </svg>
            Deal of the Day
          </div>
          <h3 className="text-white text-xl sm:text-2xl font-semibold leading-snug mb-2">
            {coupon.title}
          </h3>
          <p className="text-[#78716C] text-sm mb-6">
            {coupon.store?.name} &nbsp;·&nbsp; {coupon.description || 'Limited time offer'}
          </p>
          <button
            onClick={handleCTA}
            className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {coupon.type === 'code' ? 'Get Code' : 'Activate Deal'}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Right */}
        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center bg-[#0F0D0C] px-6 py-5 sm:px-8 sm:py-8 sm:min-w-[180px] gap-4">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl font-semibold text-[#EA580C] leading-none">
              {coupon.discount?.replace(/[^0-9%₹$]/g, '') || '—'}
            </div>
            <div className="text-[#78716C] text-sm mt-1">OFF today only</div>
          </div>
          {/* Timer */}
          <div>
            <div className="text-[#78716C] text-[10px] uppercase tracking-widest text-center mb-2">Ends in</div>
            <div className="flex items-center gap-1.5">
              {[{ v: time.h, l: 'hrs' }, { v: time.m, l: 'min' }, { v: time.s, l: 'sec' }].map(({ v, l }) => (
                <div key={l} className="bg-[#1C1917] border border-[#292524] rounded-lg px-2.5 py-2 text-center min-w-[44px]">
                  <div className="text-white text-lg font-semibold leading-none tabular-nums">{v}</div>
                  <div className="text-[#78716C] text-[9px] uppercase tracking-wider mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
