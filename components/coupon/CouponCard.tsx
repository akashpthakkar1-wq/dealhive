'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Clock, Copy, ExternalLink, Users, Zap, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Coupon } from '@/types'
import { formatDate, isExpired, getFakeUsageCount, maskCode, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

interface Props {
  coupon: Coupon
  compact?: boolean
}

export default function CouponCard({ coupon, compact }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const expired = isExpired(coupon.expiry_date)
  const usageCount = coupon.usage_count || getFakeUsageCount(coupon.id)
  const supabase = createClient()

  async function trackClick() {
    try {
      await supabase.from('clicks').insert({ coupon_id: coupon.id, user_agent: navigator.userAgent })
    } catch {}
  }

  async function handleGetCode() {
    setRevealed(true)
    await trackClick()
    setTimeout(() => window.open(coupon.affiliate_url, '_blank'), 800)
  }

  async function handleDeal() {
    await trackClick()
    window.open(coupon.affiliate_url, '_blank')
  }

  async function handleCopy() {
    if (!coupon.code) return
    try {
      await navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      toast.success('Code copied! 🎉')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error('Could not copy. Try manually.')
    }
  }

  const storeLogo = (coupon.store as any)?.logo
  const storeName = (coupon.store as any)?.name || 'Unknown Store'
  const storeSlug = (coupon.store as any)?.slug

  return (
    <div className={cn(
      'card group overflow-hidden transition-all duration-200',
      expired ? 'opacity-75' : 'hover:-translate-y-0.5',
      compact ? 'flex items-stretch' : ''
    )}>
      {/* Left: Discount badge */}
      <div className={cn(
        'relative bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col items-center justify-center border-r border-dashed border-orange-200',
        compact ? 'w-24 flex-shrink-0 py-4' : 'w-full py-5 border-r-0 border-b'
      )}>
        {/* Notch effect */}
        <div className="absolute left-[-11px] top-1/2 -translate-y-1/2 w-5 h-5 bg-orange-50/30 rounded-full border border-dashed border-orange-200 hidden md:block" />
        <div className="absolute right-[-11px] top-1/2 -translate-y-1/2 w-5 h-5 bg-orange-50/30 rounded-full border border-dashed border-orange-200 hidden md:block" />

        <div className="text-center px-3">
          {coupon.discount ? (
            <>
              <div className="font-extrabold text-orange-600 text-2xl leading-tight">{coupon.discount}</div>
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wide mt-0.5">OFF</div>
            </>
          ) : (
            <div className="font-extrabold text-orange-600 text-base">DEAL</div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        {/* Store + badges */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {storeLogo ? (
              <Link href={`/store/${storeSlug}`}>
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                  <Image src={storeLogo} alt={storeName} width={28} height={28} className="object-contain" />
                </div>
              </Link>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Gift className="w-3.5 h-3.5 text-orange-500" />
              </div>
            )}
            <Link href={`/store/${storeSlug}`} className="text-xs font-bold text-orange-600 hover:text-orange-700">
              {storeName}
            </Link>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {coupon.is_verified && (
              <span className="badge-verified">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
            {expired && <span className="badge-expired">Expired</span>}
            <span className="badge-type">
              {coupon.type === 'code' ? 'CODE' : 'DEAL'}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/coupon/${coupon.slug}`}>
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5 hover:text-orange-600 transition-colors line-clamp-2">
            {coupon.title}
          </h3>
        </Link>

        {/* Description */}
        {coupon.description && !compact && (
          <p className="text-xs text-gray-500 mb-2.5 line-clamp-2">{coupon.description}</p>
        )}

        {/* Meta: expiry + usage */}
        <div className="flex items-center gap-3 mb-3">
          {coupon.expiry_date && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{expired ? 'Expired' : `Expires ${formatDate(coupon.expiry_date)}`}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3 h-3" />
            <span>{usageCount.toLocaleString()} used</span>
          </div>
        </div>

        {/* Code reveal / Action button */}
        {coupon.type === 'code' ? (
          <div className="space-y-2">
            {!revealed ? (
              <button onClick={handleGetCode}
                className="btn-primary w-full text-sm py-2.5 rounded-lg">
                <Zap className="w-3.5 h-3.5" />
                Get Code
              </button>
            ) : (
              <div className="reveal-code">
                <div className="flex items-center border-2 border-dashed border-orange-300 rounded-lg overflow-hidden bg-orange-50">
                  <div className="flex-1 px-3 py-2 font-mono font-bold text-orange-700 text-sm tracking-wider truncate">
                    {coupon.code}
                  </div>
                  <button onClick={handleCopy}
                    className={cn(
                      'px-3 py-2 text-xs font-bold transition-colors',
                      copied ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
                    )}>
                    {copied ? '✓ Copied!' : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <a href={coupon.affiliate_url} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary w-full text-xs py-2 rounded-lg mt-1.5 flex items-center justify-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  Visit Store & Shop
                </a>
              </div>
            )}
          </div>
        ) : (
          <button onClick={handleDeal}
            className="btn-green w-full text-sm py-2.5 rounded-lg">
            <ExternalLink className="w-3.5 h-3.5" />
            Activate Deal
          </button>
        )}
      </div>
    </div>
  )
}
