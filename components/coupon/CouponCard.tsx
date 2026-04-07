'use client';

import { useState } from 'react';
import type { Coupon } from '@/types/index';

interface CouponCardProps {
  coupon: Coupon;
  // Legacy props — kept for backward compatibility, not required
  copiedId?: string | null;
  onGetCode?: (coupon: Coupon) => void;
  onCopy?: (coupon: Coupon) => void;
}

// ─── Logo helper ──────────────────────────────────────────────────────────────
function getLogoFromUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch { return '/placeholder-logo.png'; }
}

function getLogo(coupon: Coupon): string {
  if (coupon.store?.logo) return coupon.store.logo;
  if (coupon.store?.website_url) return getLogoFromUrl(coupon.store.website_url);
  if (coupon.affiliate_url) return getLogoFromUrl(coupon.affiliate_url);
  return '/placeholder-logo.png';
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const logo = getLogo(coupon);

  // ✅ BUTTON CLICK BEHAVIOR (works on ALL pages):
  // 1. Open NEW tab → current page URL + ?popup=ID (popup auto-shows there via search page)
  //    BUT since CouponCard is on many pages, we simply show the modal inline here.
  // 2. Navigate CURRENT tab → affiliate URL
  // 3. Modal shows instantly so user sees the code before the tab navigates away
  function handleCTA() {
    setModalOpen(true); // show modal immediately on current page
    // Small delay so user sees the modal before tab navigates away
    setTimeout(() => {
      window.location.href = coupon.affiliate_url;
    }, 300);
  }

  return (
    <>
      {/* ── Card ── */}
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
                className="w-10 h-10 rounded-xl border border-gray-100 flex-shrink-0 object-contain bg-white" />
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
                {/* Title — max 2 lines */}
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
                <button onClick={handleCTA}
                  className="inline-flex items-center rounded-xl overflow-hidden text-sm font-semibold shadow-sm active:scale-95 transition-transform">
                  <span className="bg-[#822a7f] text-white px-5 py-2.5 hover:bg-[#6b2268] transition-colors">
                    Get Code
                  </span>
                  <span className="bg-[#6b2268] text-purple-200 px-3 py-2.5 font-mono text-xs tracking-wider border-l border-purple-600">
                    {coupon.code?.slice(0, 4) ?? '????'}•••
                  </span>
                </button>
              ) : (
                <button onClick={handleCTA}
                  className="inline-flex items-center bg-[#822a7f] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6b2268] active:scale-95 transition-all">
                  Activate Deal →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Self-contained Modal — renders on ANY page ── */}
      {modalOpen && (
        <CouponModal coupon={coupon} logo={logo} onClose={() => setModalOpen(false)} />
      )}
    </>
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

  // ✅ Opens affiliate in NEW tab from within modal
  function handleGoToStore() {
    window.open(coupon.affiliate_url, '_blank');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-[#822a7f] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt={coupon.store?.name ?? 'Store'}
              className="w-9 h-9 rounded-lg bg-white p-0.5 object-contain flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{coupon.store?.name}</p>
              <p className="text-purple-200 text-xs line-clamp-1">{coupon.title}</p>
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
            <p className="text-3xl font-extrabold text-[#822a7f]">{coupon.discount}</p>
            <p className="text-gray-400 text-sm mt-0.5">Best available offer</p>
          </div>

          {isCode ? (
            /* ── GET CODE FLOW ── */
            <>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-widest">
                Your Coupon Code
              </p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 border-2 border-dashed border-purple-300 rounded-xl px-4 py-3 text-center font-mono font-bold text-xl text-gray-800 tracking-widest bg-purple-50 select-all">
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
                <p className="text-xs text-gray-400 mb-4">
                  🕐 Valid until {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
              <button onClick={handleGoToStore}
                className="w-full text-center bg-[#822a7f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6b2268] transition-colors">
                🔗 Go to {coupon.store?.name} & Apply Code
              </button>
              {copied && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Code copied! Paste it at checkout on the store website.
                </p>
              )}
            </>
          ) : (
            /* ── ACTIVATE DEAL FLOW ── */
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
                <p className="text-xs text-gray-400 mb-4">
                  🕐 Valid until {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
              <button onClick={handleGoToStore}
                className="w-full text-center bg-[#822a7f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6b2268] transition-colors">
                🛒 Go to {coupon.store?.name}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
