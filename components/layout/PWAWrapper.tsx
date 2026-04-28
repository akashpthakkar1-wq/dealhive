'use client'

import { useEffect, useState } from 'react'
import PWABottomNav from './PWABottomNav'

interface Props {
  children: React.ReactNode
  navbar: React.ReactNode
  footer: React.ReactNode
}

export default function PWAWrapper({ children, navbar, footer }: Props) {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const check = () => setIsPWA(window.matchMedia('(display-mode: standalone)').matches)
    check()
    window.matchMedia('(display-mode: standalone)').addEventListener('change', check)
  }, [])

  // Normal browser mode - show full navbar + footer
  if (!isPWA) {
    return (
      <>
        {navbar}
        {children}
        {footer}
      </>
    )
  }

  // PWA standalone mode - show mobile app UI
  return (
    <>
      {/* PWA Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-72x72.png" alt="EndOverPay" className="w-8 h-8 rounded-xl" />
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">EndOverPay</p>
              <p className="text-[10px] text-gray-400 leading-tight">Stop Overpaying</p>
            </div>
          </div>
          <a href="/search"
            className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center active:bg-orange-100">
            <svg className="w-4 h-4 text-[#EA580C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main content - padded for top header + bottom nav */}
      <div style={{ paddingTop: '56px', paddingBottom: '72px' }}>
        {children}
      </div>

      {/* Bottom Navigation */}
      <PWABottomNav />
    </>
  )
}
