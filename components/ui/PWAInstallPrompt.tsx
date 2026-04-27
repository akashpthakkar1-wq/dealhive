'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Check if iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    if (ios) {
      // Show iOS instructions after 3 seconds
      setTimeout(() => setShowBanner(true), 3000)
      return
    }

    // Android/Desktop: listen for install prompt
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
    if (outcome === 'accepted') setShowBanner(false)
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    setShowBanner(false)
    localStorage.setItem('pwa-dismissed', Date.now().toString())
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
        {/* App Icon */}
        <img src="/icons/icon-96x96.png" alt="EndOverPay" className="w-12 h-12 rounded-xl flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Install EndOverPay</p>
          {isIOS ? (
            <p className="text-xs text-gray-500 mt-0.5">
              Tap <span className="font-semibold">Share</span> then <span className="font-semibold">"Add to Home Screen"</span> to install
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">
              Install our app for faster access to deals & coupons
            </p>
          )}

          {!isIOS && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-[#EA580C] text-white text-xs font-semibold py-2 px-3 rounded-lg hover:bg-[#C2410C] transition-colors"
              >
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Not now
              </button>
            </div>
          )}
        </div>

        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 flex-shrink-0 -mt-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
