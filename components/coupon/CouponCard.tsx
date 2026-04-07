'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Copy, Check, ExternalLink, X, Tag, Clock, Users, Zap } from 'lucide-react'
import type { Coupon } from '@/types'
import { formatDate, isExpired } from '@/lib/utils'

interface Props { coupon: Coupon }

function stableRandom(seed: string, min: number, max: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  return min + (Math.abs(hash) % (max - min + 1))
}

export default function CouponCard({ coupon }: Props) {
  const [showPopup, setShowPopup] = useState(false)
  const [copied, setCopied] = useState(false)
  const searchParams = useSearchParams()
  const expired = isExpired(coupon.expiry_date)

  const usageCount = coupon.usage_count && coupon.usage_count > 0
    ? coupon.usage_count
    : stableRandom(coupon.id + 'uses', 200, 5000)

  const hoursAgo = stableRandom(coupon.id + 'time', 1, 23)
  const lastUsed = hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`

  // ── Auto-open popup if URL has ?popup=COUPON_ID ──
  useEffect(() => {
    const popupId = searchParams.get('popup')
    if (popupId === coupon.id) {
      setShowPopup(true)
      // Clean up URL without reloading page
      const url = new URL(window.location.href)
      url.searchParams.delete('popup')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, coupon.id])

  function handleGetCode() {
    // Build new tab URL with popup param
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('popup', coupon.id)

    // Open DealHive page in new tab with popup auto-open
    window.open(currentUrl.toString(), '_blank', 'noopener')

    // Redirect current tab to affiliate URL
    if (coupon.affiliate_url) {
      window.location.href = coupon.affiliate_url
    }
  }

  function handleActivateDeal() {
    // Same flow for deals
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('popup', coupon.id)

    window.open(currentUrl.toString(), '_blank', 'noopener')

    if (coupon.affiliate_url) {
      window.location.href = coupon.affiliate_url
    }
  }

  function handleCopyCode() {
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code).catch(() => {
        const el = document.createElement('textarea')
        el.value = coupon.code!
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      })
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleGoToStore() {
    if (coupon.affiliate_url) {
      window.location.href = coupon.affiliate_url
    }
  }

  const storeName = (coupon as any).store?.name || 'Store'
  const storeLogo = (coupon as any).store?.logo

  return (
    <>
      {/* ── LIST CARD ─────────────────────────────────── */}
      <div className={`coupon-list-card flex items-stretch overflow-hidden ${expired ? 'opacity-60' : ''}`}>

        {/* Left: Discount badge */}
        <div className="w-24 flex-shrink-0 bg-primary-50 flex flex-col items-center justify-center p-3 border-r border-primary-100">
          {coupon.discount ? (
            <>
              <span className="text-primary-600 font-extrabold text-xl leading-tight text-center">
                {coupon.discount.replace(' OFF', '').replace(' off', '')}
              </span>
              <span className="text-primary-400 text-xs font-bold uppercase mt-0.5">OFF</span>
            </>
          ) : (
            <Tag className="w-7 h-7 text-primary-400" />
          )}
          <span className={`text-xs font-bold mt-2 px-1.5 py-0.5 rounded-full ${
            coupon.type === 'code'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-purple-100 text-purple-600'
          }`}>
            {coupon.type === 'code' ? 'CODE' : 'DEAL'}
          </span>
        </div>

        {/* Center: Details */}
        <div className="flex-1 px-4 py-3 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {storeLogo && (
              <Image src={storeLogo} alt={storeName} width={18} height={18} className="rounded object-contain" />
            )}
            <span className="text-xs text-gray-400 font-semibold">{storeName}</span>
            {coupon.is_verified && (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                <CheckCircle className="w-2.5 h-2.5" /> Verified
              </span>
            )}
            {coupon.is_trending && (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">🔥 Trending</span>
            )}
            {coupon.is_featured && (
              <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">⭐ Featured</span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5">{coupon.title}</h3>

          <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
            {expired ? (
              <span className="text-red-400 font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Expired</span>
            ) : coupon.expiry_date ? (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Expires {formatDate(coupon.expiry_date)}</span>
            ) : (
              <span className="text-green-500 font-semibold">No Expiry</span>
            )}
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {usageCount.toLocaleString()} used</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> Used {lastUsed}</span>
          </div>
        </div>

        {/* Right: CTA Button */}
        <div className="flex items-center px-4 flex-shrink-0">
          {coupon.type === 'code' ? (
            <button onClick={handleGetCode}
              className="relative flex items-center gap-0 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <span className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm px-4 py-2.5 transition-colors">
                Get Code
              </span>
              {coupon.code && (
                <span className="bg-primary-600 border-l-2 border-dashed border-white/40 text-white font-mono text-xs px-2 py-2.5 font-bold tracking-wider">
                  {coupon.code.slice(0, 4)}•••
                </span>
              )}
            </button>
          ) : (
            <button onClick={handleActivateDeal}
              className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all">
              Activate Deal
            </button>
          )}
        </div>
      </div>

      {/* ── POPUP MODAL ────────────────────────────────── */}
      {showPopup && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowPopup(false) }}>
          <div className="modal-box">
            {/* Header */}
            <div className="bg-primary-500 px-6 py-5 text-white relative">
              <button onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                {storeLogo && (
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image src={storeLogo} alt={storeName} width={44} height={44} className="object-contain p-1" />
                  </div>
                )}
                <div>
                  <div className="text-white/70 text-xs font-semibold mb-0.5">{storeName}</div>
                  <div className="font-bold text-base leading-tight">{coupon.title}</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {coupon.discount && (
                <div className="text-center mb-5">
                  <div className="text-4xl font-extrabold text-primary-600 mb-1">{coupon.discount}</div>
                  <div className="text-xs text-gray-400 font-medium">Best available offer</div>
                </div>
              )}

              {/* Code reveal */}
              {coupon.code && (
                <div className="mb-5">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Coupon Code</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-primary-50 border-2 border-dashed border-primary-300 rounded-xl py-3 px-4 text-center">
                      <span className="font-mono font-extrabold text-xl text-primary-700 tracking-widest">{coupon.code}</span>
                    </div>
                    <button onClick={handleCopyCode}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                        copied ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700'
                      }`}>
                      {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                    </button>
                  </div>
                </div>
              )}

              {coupon.description && (
                <div className="mb-5 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
                  {coupon.description}
                </div>
              )}

              {coupon.expiry_date && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Valid until {formatDate(coupon.expiry_date)}</span>
                </div>
              )}

              <button onClick={handleGoToStore}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md">
                <ExternalLink className="w-4 h-4" />
                Go to {storeName} &amp; Apply Code
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                {coupon.code
                  ? 'The code has been copied. Paste it at checkout on the store website.'
                  : 'Click above to activate this deal on the store website.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
