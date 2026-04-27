'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Only show on Android devices
    const isAndroid = /android/i.test(navigator.userAgent)
    if (!isAndroid) return

    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Don't show if dismissed in last 7 days
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowBanner(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      // Track install in GA4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'PWA',
          event_label: 'Android Install',
        })
      }
    }
    setDeferredPrompt(null)
  }

  // Also track when app is launched in standalone mode
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_launch', {
          event_category: 'PWA',
          event_label: 'Standalone Launch',
        })
      }
    }
  }, [])

  function handleDismiss() {
    setShowBanner(false)
    localStorage.setItem('pwa-dismissed', Date.now().toString())
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3">
        <img src="/icons/icon-96x96.png" alt="EndOverPay" className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Install EndOverPay App</p>
          <p className="text-xs text-gray-500 mt-0.5">Get instant access to deals & coupons</p>
          <div className="flex gap-2 mt-2">
            <button onClick={handleInstall}
              className="flex-1 bg-[#EA580C] text-white text-xs font-semibold py-1.5 px-3 rounded-lg hover:bg-[#C2410C] transition-colors">
              Install App
            </button>
            <button onClick={handleDismiss}
              className="text-xs text-gray-400 py-1.5 px-2 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
