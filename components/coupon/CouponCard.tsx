'use client';

import { useState } from 'react';
import type { Coupon } from '@/types/index';
import Image from 'next/image'
import { getCouponLogo } from '@/lib/logos'
import { trustDisplay } from '@/lib/couponRanking'
import type { RankedCoupon } from '@/lib/couponRanking'

interface CouponCardProps {
  coupon: Coupon;
  copiedId?: string | null;
  onGetCode?: (coupon: Coupon) => void;
  onCopy?: (coupon: Coupon) => void;
  hideStore?: boolean;
}

function getLogo(coupon: Coupon): string {
  if (coupon.store?.logo) return coupon.store.logo;
  if (coupon.store?.website_url) return getCouponLogo({ store: coupon.store });
  if (coupon.affiliate_url) return getCouponLogo({ affiliate_url: coupon.affiliate_url });
  return '/logo.svg';
}

export default function CouponCard({ coupon, hideStore = false }: CouponCardProps) {
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
  const trust = trustDisplay(coupon);
  const rc = coupon as RankedCoupon;
  const recentlyAdded = rc._recentlyAdded === true;
  const isRanked = rc._autoTrending !== undefined || rc._autoFeatured !== undefined || rc._recentlyAdded !== undefined;
  const showTrending = isRanked ? rc._autoTrending === true : coupon.is_trending;
  const showFeatured = isRanked ? rc._autoFeatured === true : coupon.is_featured;
  const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col ${recentlyAdded ? 'border-[#EA580C] border-2' : 'border-gray-200'}`}>
      {recentlyAdded && (
        <div className="bg-orange-50 text-[#C2410C] text-[11px] font-semibold px-3 py-1 text-center border-b border-orange-100">
          ✨ Recently added — likely working
        </div>
      )}
      <div className="flex flex-1">

        <div className="relative flex flex-col items-center justify-center flex-shrink-0 text-center px-2.5 bg-white" style={{ minWidth: '90px', maxWidth: '90px', borderRight: '3px dotted #E5E7EB' }}>
          {hideStore ? (
            <span className="font-extrabold leading-tight break-words w-full" style={{ fontSize: '18px', color: '#EA580C' }}>
              {coupon.discount}
            </span>
          ) : (
            <div className="flex flex-col items-center gap-1 w-full py-2">
              <Image src={logo} alt={coupon.store?.name ?? 'Store'} width={88} height={88} className="w-11 h-11 rounded-lg object-contain" loading="lazy" />
              <span className="text-[13px] font-bold text-gray-800 leading-tight break-words w-full">{coupon.store?.name}</span>
            </div>
          )}
        </div>

        <div className="flex-1 py-3 px-4 flex flex-col gap-2 min-w-0">

          <div className="flex items-center justify-between gap-2">
            {!hideStore && coupon.discount ? (
              <span className="text-[13px] font-bold text-[#EA580C] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0">{coupon.discount}</span>
            ) : <span />}
            {showTrending && (
              <span className="text-[12px] text-orange-800 bg-orange-100 border border-orange-200 px-2 py-px rounded-full font-semibold whitespace-nowrap flex-shrink-0">🔥 Trending</span>
            )}
            {showFeatured && !showTrending && (
              <span className="text-[12px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-px rounded-full font-semibold whitespace-nowrap flex-shrink-0">⭐ Featured</span>
            )}
          </div>

          <div>
            <p className="text-[16px] font-semibold text-gray-800 leading-snug line-clamp-2">{coupon.title}</p>
            {coupon.description && (
              <p className="text-[16px] text-gray-500 mt-1 leading-snug line-clamp-1">{coupon.description}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-auto sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-y-0.5 min-w-0">
              {trust.mode === 'confirmed' && (
                <>
                  <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: '#2f7d5b' }}>👍 {trust.workedCount} confirmed working</span>
                  <span className="text-[12px] text-gray-400 whitespace-nowrap">Verified {fmtDate(trust.date)}</span>
                </>
              )}
              {trust.mode === 'verified' && (
                <span className="text-[12px] font-semibold whitespace-nowrap" style={{ color: '#2f7d5b' }}>✓ Verified {fmtDate(trust.date)}</span>
              )}
            </div>

            {isCode ? (
              <button onClick={handleCTA} disabled={loading} className="self-end sm:self-auto inline-flex items-stretch rounded-lg overflow-hidden flex-shrink-0 disabled:opacity-75 active:scale-95 transition-transform border-2 border-[#EA580C]">
                <span className="bg-[#EA580C] text-white px-3 py-1.5 flex flex-col items-start justify-center gap-0 hover:bg-[#C2410C] transition-colors">
                  <span className="text-[13px] font-semibold leading-snug whitespace-nowrap">{loading ? 'Opening...' : 'Get Code'}</span>
                  <span className="text-[11px] text-white/80 font-normal leading-snug whitespace-nowrap">tap to reveal</span>
                </span>
                <span className="bg-[#C2410C] px-2 flex items-center justify-center border-l border-orange-700">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="bg-[#FFF7ED] flex items-center overflow-hidden border-l-2 border-dashed border-[#EA580C]" style={{width:"26px", paddingLeft:"4px", paddingRight:"4px"}}>
                  <span className="font-mono text-[14px] font-semibold text-[#C2410C] tracking-wide whitespace-nowrap" style={{transform:"translateX(-7px)"}}>{coupon.code ? coupon.code.slice(-2) : "??"}</span>
                </span>
              </button>
            ) : (
              <button onClick={handleCTA} disabled={loading} className="self-end sm:self-auto inline-flex items-stretch rounded-lg overflow-hidden flex-shrink-0 disabled:opacity-75 active:scale-95 transition-transform border-2 border-[#059669]">
                <span className="bg-[#059669] text-white px-3 py-1.5 flex flex-col items-start justify-center gap-0 hover:bg-[#047857] transition-colors">
                  <span className="text-[13px] font-semibold leading-snug whitespace-nowrap">{loading ? 'Opening...' : 'Activate Deal'}</span>
                  <span className="text-[11px] text-white/80 font-normal leading-snug whitespace-nowrap">auto-applied at checkout</span>
                </span>
                <span className="bg-[#047857] px-2 flex items-center justify-center border-l border-green-700">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

      <div className="border-t border-gray-200">
        <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
          <svg className={`w-3.5 h-3.5 transition-transform duration-250 ${showDetails ? 'rotate-180' : ''}`} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{showDetails ? 'Hide details' : 'Show details'}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 mx-0.5" />
          <span className="text-gray-500">Offer info &amp; terms</span>
        </button>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[400px]' : 'max-h-0'}`}>
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
              {coupon.discount && (
                <div>
                  <p className="text-[12px] text-gray-500 uppercase tracking-wider mb-0.5">{isCode ? 'Discount' : 'Deal type'}</p>
                  <p className="text-xs font-semibold text-[#9A3412]">{coupon.discount}</p>
                </div>
              )}
              {coupon.expiry_date && (
                <div>
                  <p className="text-[12px] text-gray-500 uppercase tracking-wider mb-0.5">Expiry date</p>
                  <p className="text-xs font-semibold text-gray-800">{new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
              {coupon.min_order_value && (
                <div>
                  <p className="text-[12px] text-gray-500 uppercase tracking-wider mb-0.5">Min. order</p>
                  <p className="text-xs font-semibold text-gray-800">{coupon.min_order_value}</p>
                </div>
              )}
              <div>
                <p className="text-[12px] text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
                <p className="text-xs font-semibold text-green-600">✓ Active &amp; verified</p>
              </div>
            </div>
            {coupon.terms_conditions && (
              <div className="bg-white border border-gray-300 rounded-xl p-3">
                <p className="text-[12px] text-gray-500 uppercase tracking-wider font-medium mb-2">Terms &amp; conditions</p>
                <p className="text-xs text-gray-500 leading-relaxed">{coupon.terms_conditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
