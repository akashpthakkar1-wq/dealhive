'use client';

import { useState } from 'react';
import type { Coupon } from '@/types/index';
import { getCouponLogo } from '@/lib/logos'

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
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', coupon.type === 'code' ? 'get_code_click' : 'activate_deal_click', {
        store_name: coupon.store?.name || '',
        coupon_title: coupon.title?.substring(0, 50) || '',
        discount: coupon.discount || '',
        coupon_type: coupon.type,
      })
    }
    window.open(popupUrl, '_blank');
    import('@supabase/supabase-js').then(({ createClient }) => {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      sb.from('coupons').select('affiliate_url').eq('id', coupon.id).single()
        .then(({ data }) => { window.location.href = data?.affiliate_url || coupon.affiliate_url })
    }).catch(() => { window.location.href = coupon.affiliate_url })
    import('@supabase/supabase-js').then(({ createClient }) => {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      sb.from('coupons').update({ usage_count: (coupon.usage_count || 0) + 1 }).eq('id', coupon.id).then(() => {})
    }).catch(() => {})
  }

  const isCode = coupon.type === 'code';
  const displayCount = (coupon.usage_count || 0) + stableNum(String(coupon.id), 15, 199)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      <div className="flex flex-1">

        <div className="flex flex-col items-center justify-center flex-shrink-0 text-center px-2.5 bg-[#EA580C]" style={{ minWidth: '90px', maxWidth: '90px' }}>
          <span className="text-white font-extrabold leading-tight break-words w-full" style={{ fontSize: '17px' }}>
            {coupon.discount}
          </span>
        </div>

        <div className="flex-1 py-3 px-4 flex flex-col gap-2 min-w-0">

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={logo} alt={coupon.store?.name ?? 'Store'} className="w-10 h-10 rounded-lg object-contain flex-shrink-0" loading="lazy" fetchPriority="low" />
              <span className="text-[15px] font-bold text-gray-900 truncate">{coupon.store?.name}</span>
            </div>
            {coupon.is_trending && (
              <span className="text-[10px] text-orange-800 bg-orange-100 border border-orange-200 px-2 py-px rounded-full font-semibold whitespace-nowrap flex-shrink-0">🔥 Trending</span>
            )}
            {coupon.is_featured && !coupon.is_trending && (
              <span className="text-[10px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-px rounded-full font-semibold whitespace-nowrap flex-shrink-0">⭐ Featured</span>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{coupon.title}</p>
            {coupon.description && (
              <p className="text-xs text-gray-500 mt-1 leading-snug line-clamp-1">{coupon.description}</p>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 mt-auto sm:flex-row-reverse sm:items-center sm:justify-between">
            <div className="flex flex-col gap-y-0.5 min-w-0 sm:items-end sm:text-right">
              <span className="text-[11px] text-gray-500 whitespace-nowrap">👥 {displayCount.toLocaleString()} used</span>
              {coupon.is_verified && (
                <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: '#2f7d5b' }}>✓ Verified today</span>
              )}
            </div>

            {isCode ? (
              <button onClick={handleCTA} disabled={loading} className="self-start sm:self-auto inline-flex items-stretch rounded-lg overflow-hidden flex-shrink-0 disabled:opacity-75 active:scale-95 transition-transform border-2 border-[#EA580C]">
                <span className="bg-[#EA580C] text-white px-3 py-1.5 flex flex-col items-start justify-center gap-0 hover:bg-[#C2410C] transition-colors">
                  <span className="text-[13px] font-semibold leading-snug whitespace-nowrap">{loading ? 'Opening...' : 'Get Code'}</span>
                  <span className="text-[9px] text-white/80 font-normal leading-snug whitespace-nowrap">tap to reveal</span>
                </span>
                <span className="bg-[#C2410C] px-2 flex items-center justify-center border-l border-orange-700">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="bg-[#FFF7ED] flex items-center overflow-hidden border-l-2 border-dashed border-[#EA580C]" style={{width:"26px", paddingLeft:"4px", paddingRight:"4px"}}>
                  <span className="font-mono text-[14px] font-semibold text-[#C2410C] tracking-wide whitespace-nowrap" style={{transform:"translateX(-7px)"}}>{coupon.code ? coupon.code.slice(-2) : "??"}</span>
                </span>
              </button>
            ) : (
              <button onClick={handleCTA} disabled={loading} className="self-start sm:self-auto inline-flex items-stretch rounded-lg overflow-hidden flex-shrink-0 disabled:opacity-75 active:scale-95 transition-transform border-2 border-[#059669]">
                <span className="bg-[#059669] text-white px-3 py-1.5 flex flex-col items-start justify-center gap-0 hover:bg-[#047857] transition-colors">
                  <span className="text-[13px] font-semibold leading-snug whitespace-nowrap">{loading ? 'Opening...' : 'Activate Deal'}</span>
                  <span className="text-[9px] text-white/80 font-normal leading-snug whitespace-nowrap">auto-applied at checkout</span>
                </span>
                <span className="bg-[#047857] px-2 flex items-center justify-center border-l border-green-700">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

      <div className="border-t border-gray-100">
        <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
          <svg className={`w-3.5 h-3.5 transition-transform duration-250 ${showDetails ? 'rotate-180' : ''}`} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{showDetails ? 'Hide details' : 'Show details'}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 mx-0.5" />
          <span className="text-gray-500">Offer info &amp; terms</span>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[400px]' : 'max-h-0'}`}>
          <div className="bg-gray-50 border-t border-gray-100 p-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
              {coupon.discount && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{isCode ? 'Discount' : 'Deal type'}</p>
                  <p className="text-xs font-semibold text-[#9A3412]">{coupon.discount}</p>
                </div>
              )}
              {coupon.expiry_date && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Expiry date</p>
                  <p className="text-xs font-semibold text-gray-800">{new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
              {coupon.min_order_value && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Min. order</p>
                  <p className="text-xs font-semibold text-gray-800">{coupon.min_order_value}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
                <p className="text-xs font-semibold text-green-600">✓ Active &amp; verified</p>
              </div>
            </div>
            {coupon.terms_conditions && (
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">Terms &amp; conditions</p>
                <p className="text-xs text-gray-500 leading-relaxed">{coupon.terms_conditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
