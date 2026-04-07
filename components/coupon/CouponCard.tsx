'use client';

import { useState } from 'react';
import type { Coupon } from '@/types/index';

interface CouponCardProps {
  coupon: Coupon;
  copiedId?: string | null;
  onGetCode?: (coupon: Coupon) => void;
  onCopy?: (coupon: Coupon) => void;
}

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
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const logoUrl = getLogoUrl(coupon);

  function handleGetCode() {
    setModalOpen(true);
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code).catch(() => {});
    }
    window.open(coupon.affiliate_url, '_blank');
    if (onGetCode) onGetCode(coupon);
  }

  function handleCopy() {
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
    if (onCopy) onCopy(coupon);
  }

  return (
    <>
      {/*
        ── KEY LAYOUT RULES FOR EQUAL-HEIGHT GRID ──
        • outer div: h-full flex flex-col  → stretches to fill grid cell height
        • inner flex row: flex-1           → fills remaining vertical space
        • content area: flex flex-col flex-1
        • CTA row: mt-auto pt-3            → always pushed to bottom
      */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        <div className="flex flex-1">

          {/* ── Left discount badge — desktop only ── */}
          <div className="hidden sm:flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100/60 px-4 w-[90px] flex-shrink-0 text-center border-r border-purple-100">
            <span className="text-sm font-extrabold text-[#822a7f] leading-tight break-words text-center w-full">
              {coupon.discount}
            </span>
            <span className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
              coupon.type === 'code' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {coupon.type}
            </span>
          </div>

          {/* ── Main content — flex col so CTA goes to bottom ── */}
          <div className="flex-1 p-4 flex flex-col min-w-0">

            {/* Row 1: Logo + Store + Badges */}
            <div className="flex items-start gap-3">
              <img
                src={logoUrl}
                alt={coupon.store?.name ?? 'Store'}
                className="w-10 h-10 rounded-xl border border-gray-100 flex-shrink-0 object-contain bg-white"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 truncate max-w-[100px]">
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
                  {/* Mobile-only discount badge */}
                  <span className="sm:hidden ml-auto text-xs font-extrabold text-[#822a7f] bg-purple-50 border border-purple-200 px-2 py-px rounded-full whitespace-nowrap flex-shrink-0">
                    {coupon.discount}
                  </span>
                </div>
                {/* Title — clamped to 2 lines, won't break layout */}
                <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">
                  {coupon.title}
                </p>
              </div>
            </div>

            {/* Row 2: Meta info — grows to fill space */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400 flex-1">
              {coupon.expiry_date && (
                <span>🕐 Expires {new Date(coupon.expiry_date).toLocaleDateString('en-IN')}</span>
              )}
              {coupon.usage_count > 0 && (
                <span>👥 {coupon.usage_count.toLocaleString()} used</span>
              )}
            </div>

            {/* Row 3: CTA — mt-auto always pushes to bottom */}
            <div className="mt-auto pt-3">
              {coupon.type === 'code' ? (
                <button
                  onClick={handleGetCode}
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

      {/* ── Popup Modal (self-contained, no prop drilling needed) ── */}
      {modalOpen && coupon.type === 'code' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#822a7f] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt={coupon.store?.name ?? 'Store'}
                  className="w-9 h-9 rounded-lg bg-white p-0.5 object-contain" />
                <div>
                  <p className="text-white font-semibold text-sm">{coupon.store?.name}</p>
                  <p className="text-purple-200 text-xs line-clamp-1">{coupon.title}</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">
                ×
              </button>
            </div>
            <div className="p-5">
              <div className="text-center mb-4">
                <p className="text-3xl font-extrabold text-[#822a7f]">{coupon.discount}</p>
                <p className="text-gray-400 text-sm">Best available offer</p>
              </div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2 tracking-wide">Your Coupon Code</p>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 border-2 border-dashed border-purple-300 rounded-xl px-4 py-3 text-center font-mono font-bold text-lg text-gray-800 tracking-widest bg-purple-50">
                  {coupon.code}
                </div>
                <button onClick={handleCopy}
                  className={`px-4 rounded-xl text-sm font-semibold transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              {coupon.description && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 mb-3">
                  {coupon.description}
                </div>
              )}
              {coupon.expiry_date && (
                <p className="text-xs text-gray-400 mb-4">
                  🕐 Valid until {new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              <a href={coupon.affiliate_url} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-[#822a7f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6b2268] transition-colors">
                🔗 Go to {coupon.store?.name} & Apply Code
              </a>
              {copied && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Code copied! Paste it at checkout on the store website.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
