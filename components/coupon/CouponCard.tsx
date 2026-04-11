'use client';

import type { Coupon } from '@/types/index';
import { getCouponLogo, getStoreLogo } from '@/lib/logos'

interface CouponCardProps {
  coupon: Coupon;
  // Legacy props — kept for backward compatibility
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
    // ✅ Step 1: Open NEW tab → current page URL + ?popup=COUPON_ID
    // GlobalPopupHandler in layout.tsx detects this and shows the modal
    const currentPage = window.location.origin + window.location.pathname;
    const popupUrl = `${currentPage}?popup=${encodeURIComponent(coupon.id)}`;
    window.open(popupUrl, '_blank');

    // ✅ Step 2: Navigate CURRENT tab → affiliate URL
    window.location.href = coupon.affiliate_url;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      <div className="flex flex-1">

        {/* Left discount badge — desktop only */}
        <div className="hidden sm:flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100/60 w-[88px] flex-shrink-0 text-center border-r border-purple-100 px-2">
          <span className="text-sm font-extrabold text-[#822a7f] leading-tight break-words w-full text-center">
            {coupon.discount}
          </span>
          <span className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            coupon.type === 'code' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
          }`}>
            {coupon.type}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 flex flex-col min-w-0">

          {/* Logo + Store + Badges */}
          <div className="flex items-start gap-3">
            <img src={logo} alt={coupon.store?.name ?? 'Store'}
              className="w-10 h-10 rounded-xl border border-gray-100 flex-shrink-0 object-contain bg-white p-1.5 w-full h-full" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-xs font-semibold text-gray-500 truncate max-w-[120px]">
                  {coupon.store?.name}
                </span>
                {coupon.is_verified && (
                  <span className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-px rounded-full font-semibold whitespace-nowrap">
                    ✅ Verified
                  </span>
                )}
                {coupon.is_trending && (
                  <span className="text-[11px] text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-px rounded-full font-semibold whitespace-nowrap">
                    🔥 Trending
                  </span>
                )}
                {coupon.is_featured && (
                  <span className="text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-1.5 py-px rounded-full font-semibold whitespace-nowrap">
                    ⭐ Featured
                  </span>
                )}
                {/* Mobile discount badge */}
                <span className="sm:hidden ml-auto text-xs font-extrabold text-[#822a7f] bg-purple-50 border border-purple-200 px-2 py-px rounded-full whitespace-nowrap flex-shrink-0">
                  {coupon.discount}
                </span>
              </div>
              {/* Title — max 2 lines, won't break layout */}
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">
                {coupon.title}
              </p>
            </div>
          </div>

          {/* Meta — flex-1 pushes CTA to bottom */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-400 flex-1 content-start">
            {coupon.expiry_date && (
              <span>🕐 Expires {new Date(coupon.expiry_date).toLocaleDateString('en-IN')}</span>
            )}
            {coupon.usage_count > 0 && (
              <span>👥 {coupon.usage_count.toLocaleString()} used</span>
            )}
          </div>

          {/* CTA — mt-auto always at bottom */}
          <div className="mt-auto pt-3">
            {coupon.type === 'code' ? (
              <button
                onClick={handleCTA}
                className="inline-flex items-center rounded-xl overflow-hidden text-sm font-semibold shadow-sm active:scale-95 transition-transform"
              >
                <span className="bg-[#822a7f] text-white px-5 py-2.5 hover:bg-[#6b2268] transition-colors">
                  Get Code
                </span>
                <span className="bg-[#6b2268] text-purple-200 px-3 py-2.5 font-mono text-xs tracking-wider border-l border-purple-600">
                  {coupon.code?.slice(0, 4) ?? '????'}•••
                </span>
              </button>
            ) : (
              <button
                onClick={handleCTA}
                className="inline-flex items-center bg-[#822a7f] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6b2268] active:scale-95 transition-all"
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
