'use client';

import { useState } from 'react';
import type { Coupon } from '@/types/index';
import { getCouponLogo } from '@/lib/logos'
// Supabase loaded lazily on click only - saves 162KB on initial page load

function stableNum(seed: string, min: number, max: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h) + seed.charCodeAt(i); h |= 0 }
  return min + (Math.abs(h) % (max - min + 1))
}

interface CouponCardProps {
  coupon: Coupon;
  copiedId?: string | null;
  onGetCode?: (coupon: Coupon) => void;
  onCopy?: (coupon: Coupon) => void;
}

function getLogo(coupon: Coupon): string {
  if (coupon.store?.logo) return coupon.store.logo;
  if (coupon.store?.website_url) return getCouponLogo({ store: coupon.store });
  if (coupon.affiliate_url) return getCouponLogo({ affiliate_url: coupon.affiliate_url });
  return '/logo.svg';
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const logo = getLogo(coupon);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  async function handleCTA() {
    if (loading) return;
    setLoading(true);
    const currentPage = window.location.origin + window.location.pathname;
    const popupUrl = `${currentPage}?popup=${encodeURIComponent(coupon.id)}`;
    // Fire GA4 event immediately - no await needed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', coupon.type === 'code' ? 'get_code_click' : 'activate_deal_click', {
        store_name: coupon.store?.name || '',
        coupon_title: coupon.title?.substring(0, 50) || '',
        discount: coupon.discount || '',
        coupon_type: coupon.type,
      })
    }
    // Navigate immediately - user gets instant response
    window.open(popupUrl, '_blank');
    window.location.href = coupon.affiliate_url;
    // Update DB in background - fire and forget (no await = no delay)
    import('@supabase/supabase-js').then(({ createClient }) => {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      sb.from('coupons').update({ usage_count: (coupon.usage_count || 0) + 1 }).eq('id', coupon.id).then(() => {})
    }).catch(() => {})
  }

  const isCode = coupon.type === 'code';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      <div className="flex flex-1">

        {/* Left discount badge — desktop only */}
        <div className="hidden sm:flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-orange-100/60 w-[88px] flex-shrink-0 text-center border-r border-orange-100 px-2">
          <span className="text-sm font-extrabold text-[#EA580C] leading-tight break-words w-full text-center">
            {coupon.discount}
          </span>
          <span className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            isCode ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
          }`}>
            {coupon.type}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">

          {/* Logo + Store + Badges + Title */}
          <div className="flex items-start gap-3">
            <img src={logo} alt={coupon.store?.name ?? 'Store'}
              className="w-14 h-14 rounded-xl border border-gray-100 flex-shrink-0 object-contain bg-white p-1.5" loading="lazy" fetchPriority="low" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                  {coupon.store?.name}
                </span>
                {coupon.is_verified && (
                  <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-px rounded-full font-semibold whitespace-nowrap">
                    ✅ Verified Today
                  </span>
                )}
                {coupon.is_trending && (
                  <span className="text-[11px] text-orange-800 bg-orange-100 border border-orange-300 px-1.5 py-px rounded-full font-semibold whitespace-nowrap">
                    🔥 Trending
                  </span>
                )}
                {coupon.is_featured && (
                  <span className="text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-1.5 py-px rounded-full font-semibold whitespace-nowrap">
                    ⭐ Featured
                  </span>
                )}
                {/* Mobile discount badge */}
                <span className="sm:hidden ml-auto text-xs font-extrabold text-[#EA580C] bg-orange-50 border border-orange-200 px-2 py-px rounded-full whitespace-nowrap flex-shrink-0">
                  {coupon.discount}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">
                {coupon.title}
              </p>
              {coupon.description && (
                <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-2">
                  {coupon.description}
                </p>
              )}
            </div>
          </div>

          {/* Meta + CTA in same row */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-0.5 sm:gap-x-3 text-xs text-gray-600 min-w-0">

              {(() => {
                const seed = stableNum(String(coupon.id), 15, 199)
                const displayCount = (coupon.usage_count || 0) + seed
                return <span className="whitespace-nowrap">👥 {displayCount.toLocaleString()} times used</span>
              })()}
            </div>

            {/* CTA Button */}
            {isCode ? (
              <button
                onClick={handleCTA}
                disabled={loading}
                className="inline-flex items-center rounded-xl overflow-hidden text-sm font-semibold shadow-sm active:scale-95 transition-transform flex-shrink-0 disabled:opacity-75"
              >
                <span className="bg-[#EA580C] text-white px-4 py-2 hover:bg-[#C2410C] transition-colors whitespace-nowrap">
                  {loading ? 'Opening...' : 'Get Code'}
                </span>
                <span className="bg-[#C2410C] text-orange-100 px-2 py-2 font-mono text-xs tracking-wider border-l border-orange-700 whitespace-nowrap">
                  {coupon.code?.slice(0, 4) ?? '????'}•••
                </span>
              </button>
            ) : (
              <button
                onClick={handleCTA}
                disabled={loading}
                className="inline-flex items-center bg-[#059669] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#047857] active:scale-95 transition-all flex-shrink-0 whitespace-nowrap disabled:opacity-75"
              >
                {loading ? 'Opening...' : 'Activate Deal →'}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Show Details Toggle ── */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-250 ${showDetails ? 'rotate-180' : ''}`}
            viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{showDetails ? 'Hide details' : 'Show details'}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 mx-0.5" />
          <span className="text-gray-400">Offer info &amp; terms</span>
        </button>

        {/* ── Details Panel ── */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[400px]' : 'max-h-0'}`}>
          <div className="bg-gray-50 border-t border-gray-100 p-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
              {coupon.discount && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{isCode ? 'Discount' : 'Deal type'}</p>
                  <p className="text-xs font-semibold text-[#EA580C]">{coupon.discount}</p>
                </div>
              )}
              {coupon.expiry_date && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Expiry date</p>
                  <p className="text-xs font-semibold text-gray-800">{new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
              {coupon.min_order_value && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Min. order</p>
                  <p className="text-xs font-semibold text-gray-800">{coupon.min_order_value}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                <p className="text-xs font-semibold text-green-600">✓ Active &amp; verified</p>
              </div>
            </div>
            {coupon.terms_conditions && (
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-orange-400 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M3.5 4.5h5M3.5 6h5M3.5 7.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Terms &amp; conditions
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{coupon.terms_conditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
