'use client';

import type { Coupon } from '@/types/index';
import { getCouponLogo } from '@/lib/logos'

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

  function handleCTA() {
    const currentPage = window.location.origin + window.location.pathname;
    const popupUrl = `${currentPage}?popup=${encodeURIComponent(coupon.id)}`;
    window.open(popupUrl, '_blank');
    window.location.href = coupon.affiliate_url;
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
              className="w-14 h-14 rounded-xl border border-gray-100 flex-shrink-0 object-contain bg-white p-1.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                  {coupon.store?.name}
                </span>
                {coupon.is_verified && (
                  <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-px rounded-full font-semibold whitespace-nowrap">
                    ✅ Verified
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
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 min-w-0">
              {coupon.expiry_date && (
                <span className="whitespace-nowrap">🕐 Expires {new Date(coupon.expiry_date).toLocaleDateString('en-GB')}</span>
              )}
              {coupon.usage_count > 0 && (
                <span className="whitespace-nowrap">👥 {coupon.usage_count.toLocaleString()} used</span>
              )}
            </div>

            {/* CTA Button */}
            {isCode ? (
              <button
                onClick={handleCTA}
                className="inline-flex items-center rounded-xl overflow-hidden text-sm font-semibold shadow-sm active:scale-95 transition-transform flex-shrink-0"
              >
                <span className="bg-[#EA580C] text-white px-4 py-2 hover:bg-[#C2410C] transition-colors whitespace-nowrap">
                  Get Code
                </span>
                <span className="bg-[#C2410C] text-orange-100 px-2 py-2 font-mono text-xs tracking-wider border-l border-orange-700 whitespace-nowrap">
                  {coupon.code?.slice(0, 4) ?? '????'}•••
                </span>
              </button>
            ) : (
              <button
                onClick={handleCTA}
                className="inline-flex items-center bg-[#059669] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#047857] active:scale-95 transition-all flex-shrink-0 whitespace-nowrap"
              >
                Activate Deal →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
