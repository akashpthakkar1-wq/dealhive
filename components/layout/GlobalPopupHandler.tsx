'use client';

import { useEffect, useState } from 'react';
import { getCouponLogo, getStoreLogo } from '@/lib/logos'
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { Coupon } from '@/types/index';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getLogo(coupon: Coupon): string {
  if (coupon.store?.logo) return coupon.store.logo;
  if (coupon.store?.website_url) return getCouponLogo({ store: coupon.store });
  if (coupon.affiliate_url) return getCouponLogo({ affiliate_url: coupon.affiliate_url });
  return '/logo.svg';
}

export default function GlobalPopupHandler() {
  const searchParams = useSearchParams();
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    const popupId = searchParams.get('popup');
    if (!popupId) return;

    // Fetch the specific coupon by ID with store join
    supabase
      .from('coupons')
      .select('*, store:stores(*)')
      .eq('id', popupId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setCoupon(data as Coupon);
      });
  }, [searchParams]);

  function handleClose() {
    setCoupon(null);
    // Clean up the ?popup= param from URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.delete('popup');
    window.history.replaceState({}, '', url.toString());
  }

  if (!coupon) return null;

  return <CouponModal coupon={coupon} logo={getLogo(coupon)} onClose={handleClose} />;
}


// ─── Inline Details & Terms Section ──────────────────────────────────────────
function DetailsSection({ coupon }: { coupon: Coupon }) {
  if (!coupon.discount && !coupon.expiry_date && !coupon.description) return null;
  return (
    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" viewBox="0 0 12 12" fill="none">
          <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M3.5 4.5h5M3.5 6h5M3.5 7.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Offer details &amp; terms</p>
      </div>
      {/* Info grid */}
      <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 bg-white">
        {coupon.discount && (
          <div className="px-3 py-2">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">{coupon.type === 'code' ? 'Discount' : 'Deal type'}</p>
            <p className="text-xs font-semibold text-[#EA580C]">{coupon.discount}</p>
          </div>
        )}
        {coupon.expiry_date && (
          <div className="px-3 py-2">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Expiry date</p>
            <p className="text-xs font-semibold text-gray-800">{new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        )}
        {coupon.min_order_value && (
          <div className="px-3 py-2">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Min. order</p>
            <p className="text-xs font-semibold text-gray-800">{coupon.min_order_value}</p>
          </div>
        )}
        <div className="px-3 py-2">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Status</p>
          <p className="text-xs font-semibold text-green-600">✓ Active &amp; verified</p>
        </div>
      </div>
      {/* Terms */}
      {coupon.terms_conditions && (
        <div className="px-3 py-2.5 bg-orange-50 border-t border-gray-100">
          <p className="text-[9px] text-orange-700 uppercase tracking-wider font-semibold mb-1">Terms &amp; conditions</p>
          <p className="text-xs text-gray-500 leading-relaxed">{coupon.terms_conditions}</p>
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function CouponModal({
  coupon, logo, onClose,
}: {
  coupon: Coupon; logo: string; onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isCode = coupon.type === 'code';

  function handleCopy() {
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  }

  function handleGoToStore() {
    window.open(coupon.affiliate_url, '_blank');
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#EA580C] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt={coupon.store?.name ?? 'Store'}
              className="w-9 h-9 rounded-lg bg-white p-0.5 object-contain flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{coupon.store?.name}</p>
              <p className="text-orange-200 text-xs line-clamp-1">{coupon.title}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 flex-shrink-0 ml-3">
            ×
          </button>
        </div>

        <div className="p-5">
          {/* Discount */}
          <div className="text-center mb-5">
            <p className="text-3xl font-extrabold text-[#EA580C]">{coupon.discount}</p>
            <p className="text-gray-500 text-sm mt-0.5">Best available offer</p>
          </div>

          {isCode ? (
            <>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-widest">
                Your Coupon Code
              </p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 border-2 border-dashed border-orange-300 rounded-xl px-4 py-3 text-center font-mono font-bold text-xl text-gray-800 tracking-widest bg-orange-50 select-all">
                  {coupon.code}
                </div>
                <button onClick={handleCopy}
                  className={`px-4 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              {coupon.description && (
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-600 mb-3">
                  {coupon.description}
                </div>
              )}
              {coupon.expiry_date && (
                <p className="text-xs text-gray-500 mb-4">
                  🕐 Valid until {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
              <button onClick={handleGoToStore}
                className="w-full text-center bg-[#EA580C] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C2410C] transition-colors">
                🔗 Go to {coupon.store?.name} & Apply Code
              </button>
              {copied && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  Code copied! Paste it at checkout on the store website.
                </p>
              )}
              <DetailsSection coupon={coupon} />
            </>
          ) : (
            <>
              {coupon.description && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 mb-4">
                  {coupon.description}
                </div>
              )}
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <span className="text-green-500 text-lg flex-shrink-0">✅</span>
                <p className="text-sm text-green-700 font-medium leading-snug">
                  Discount will be applied automatically on the store page. No code needed!
                </p>
              </div>
              {coupon.expiry_date && (
                <p className="text-xs text-gray-500 mb-4">
                  🕐 Valid until {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
              <button onClick={handleGoToStore}
                className="w-full text-center bg-[#EA580C] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C2410C] transition-colors">
                🛒 Go to {coupon.store?.name}
              </button>
              <DetailsSection coupon={coupon} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
