'use client';

import type { Coupon } from '@/types/index';

interface CouponCardProps {
  coupon: Coupon;
  copiedId?: string | null;
  onGetCode?: (coupon: Coupon) => void;
  onCopy?: (coupon: Coupon) => void;
}

// ✅ Real logo logic: store.logo first, then Google favicon from website_url, then affiliate_url
function getLogoUrl(coupon: Coupon): string {
  if (coupon.store?.logo) return coupon.store.logo;
  const domain = coupon.store?.website_url || coupon.affiliate_url || '';
  try {
    const hostname = new URL(domain).hostname.replace('www.', '');
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return '/placeholder-logo.png';
  }
}

export default function CouponCard({ coupon, copiedId, onGetCode, onCopy }: CouponCardProps) {
  const isCopied = copiedId === coupon.id;
  const logoUrl = getLogoUrl(coupon);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex">

        {/* ── Left discount badge — desktop only ── */}
        <div className="hidden sm:flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100/60 px-4 min-w-[90px] text-center border-r border-purple-100">
          {/* ✅ discount field already has "25% OFF" — no extra OFF appended */}
          <span className="text-sm font-extrabold text-[#822a7f] leading-tight">
            {coupon.discount}
          </span>
          <span
            className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
              coupon.type === 'code'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-orange-100 text-orange-600'
            }`}
          >
            {coupon.type}
          </span>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 p-4">

          {/* Row 1: Logo + Store name + Badges + Mobile discount */}
          <div className="flex items-start gap-3">
            {/* ✅ Real store logo */}
            <img
              src={logoUrl}
              alt={coupon.store?.name ?? 'Store'}
              className="w-10 h-10 rounded-xl border border-gray-100 flex-shrink-0 object-contain bg-white"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-xs font-semibold text-gray-500 truncate">
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
                {/* Mobile-only discount badge — no extra OFF */}
                <span className="sm:hidden ml-auto text-xs font-extrabold text-[#822a7f] bg-purple-50 border border-purple-200 px-2 py-px rounded-full whitespace-nowrap">
                  {coupon.discount}
                </span>
              </div>

              {/* Title clamped to 2 lines */}
              <p className="text-sm sm:text-base font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">
                {coupon.title}
              </p>
            </div>
          </div>

          {/* Row 2: Meta info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
            {coupon.expiry_date && (
              <span>
                🕐 Expires{' '}
                {new Date(coupon.expiry_date).toLocaleDateString('en-IN')}
              </span>
            )}
            {coupon.usage_count > 0 && (
              <span>👥 {coupon.usage_count.toLocaleString()} used</span>
            )}
          </div>

          {/* Row 3: CTA — ✅ Activate Deal same size/style as Get Code */}
          <div className="mt-3">
            {coupon.type === 'code' ? (
              <button
                onClick={() => onGetCode?.(coupon)}
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
              // ✅ inline-flex instead of block w-full — matches Get Code button width
              <a
                href={coupon.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#822a7f] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6b2268] active:scale-95 transition-all"
              >
                Activate Deal →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
