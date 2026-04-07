'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Coupon } from '@/types/index';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FILTERS = [
  { label: 'All Deals', value: 'all' },
  { label: '🏷️ Codes', value: 'code' },
  { label: '🔥 Deals', value: 'deal' },
  { label: '✅ Verified', value: 'verified' },
  { label: '⭐ Featured', value: 'featured' },
  { label: '🔥 Trending', value: 'trending' },
];

export default function SearchPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f) setFilter(f);
    const q = params.get('q');
    if (q) setSearch(q);
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    // ✅ JOIN stores so we get store name + logo + website
    const { data, error } = await supabase
      .from('coupons')
      .select('*, store:stores(*)')
      .order('created_at', { ascending: false });
    if (!error && data) setCoupons(data as Coupon[]);
    setLoading(false);
  }

  function handleGetCode(coupon: Coupon) {
    setModalCoupon(coupon);
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code).catch(() => {});
    }
    // Open affiliate in new tab so modal stays visible
    window.open(coupon.affiliate_url, '_blank');
  }

  function handleCopy(coupon: Coupon) {
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code).then(() => {
        setCopiedId(coupon.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }
  }

  const filtered = coupons.filter((c) => {
    // ✅ Use correct field names from global Coupon type
    const storeName = c.store?.name ?? '';
    const matchSearch =
      search === '' ||
      storeName.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'code' && c.type === 'code') ||
      (filter === 'deal' && c.type === 'deal') ||
      (filter === 'verified' && c.is_verified) ||
      (filter === 'featured' && c.is_featured) ||
      (filter === 'trending' && c.is_trending);

    return matchSearch && matchFilter;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#822a7f] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">New Deals & Coupons</h1>
          <p className="text-purple-200 mb-6">
            Latest verified coupon codes and deals — updated daily
          </p>
          <input
            type="text"
            placeholder="Search stores or deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xl px-4 py-3 rounded-xl text-gray-800 text-base outline-none shadow"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-[#822a7f] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#822a7f] hover:text-[#822a7f]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading deals...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No deals found.</div>
        ) : (
          // ✅ 2-column grid on desktop, 1-column on mobile
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((coupon) => (
              <SearchCouponCard
                key={coupon.id}
                coupon={coupon}
                copiedId={copiedId}
                onGetCode={handleGetCode}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {modalCoupon && (
        <CouponModal
          coupon={modalCoupon}
          copiedId={copiedId}
          onCopy={handleCopy}
          onClose={() => setModalCoupon(null)}
        />
      )}
    </main>
  );
}

// ─── Logo helper ──────────────────────────────────────────────────────────────
function getLogoUrl(coupon: Coupon): string {
  // 1. Use store logo if available (direct image URL)
  if (coupon.store?.logo) return coupon.store.logo;
  // 2. Use Google favicon from store website
  const domain = coupon.store?.website_url || coupon.affiliate_url || '';
  try {
    const hostname = new URL(domain).hostname.replace('www.', '');
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return '/placeholder-logo.png';
  }
}

// ─── Coupon Card ──────────────────────────────────────────────────────────────
function SearchCouponCard({
  coupon,
  copiedId,
  onGetCode,
  onCopy,
}: {
  coupon: Coupon;
  copiedId: string | null;
  onGetCode: (c: Coupon) => void;
  onCopy: (c: Coupon) => void;
}) {
  const logoUrl = getLogoUrl(coupon);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex">
        {/* ── Left discount badge (desktop only) ── */}
        <div className="hidden sm:flex flex-col items-center justify-center bg-purple-50 px-4 min-w-[90px] text-center border-r border-purple-100">
          {/* ✅ No extra OFF — discount field already contains "25% OFF" */}
          <span className="text-sm font-extrabold text-[#822a7f] leading-tight text-center">
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
          {/* Row 1: Logo + Store + Badges */}
          <div className="flex items-start gap-3">
            {/* ✅ Real store logo */}
            <img
              src={logoUrl}
              alt={coupon.store?.name ?? 'Store'}
              className="w-9 h-9 rounded-lg border border-gray-100 flex-shrink-0 object-contain"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 truncate">
                  {coupon.store?.name}
                </span>
                {coupon.is_verified && (
                  <span className="text-[11px] text-green-600 bg-green-50 border border-green-200 px-1.5 py-px rounded-full font-medium whitespace-nowrap">
                    ✅ Verified
                  </span>
                )}
                {coupon.is_trending && (
                  <span className="text-[11px] text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-px rounded-full font-medium whitespace-nowrap">
                    🔥 Trending
                  </span>
                )}
                {/* Mobile-only discount badge — no extra OFF */}
                <span className="sm:hidden ml-auto text-xs font-bold text-[#822a7f] bg-purple-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {coupon.discount}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">
                {coupon.title}
              </p>
            </div>
          </div>

          {/* Row 2: Meta */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
            {coupon.expiry_date && (
              <span>🕐 Expires {new Date(coupon.expiry_date).toLocaleDateString('en-IN')}</span>
            )}
            {coupon.usage_count > 0 && (
              <span>👥 {coupon.usage_count.toLocaleString()} used</span>
            )}
          </div>

          {/* Row 3: CTA — ✅ Activate Deal same size as Get Code */}
          <div className="mt-3">
            {coupon.type === 'code' ? (
              <button
                onClick={() => onGetCode(coupon)}
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
  );
}

// ─── Coupon Modal ─────────────────────────────────────────────────────────────
function CouponModal({
  coupon,
  copiedId,
  onCopy,
  onClose,
}: {
  coupon: Coupon;
  copiedId: string | null;
  onCopy: (c: Coupon) => void;
  onClose: () => void;
}) {
  const copied = copiedId === coupon.id;
  const logoUrl = getLogoUrl(coupon);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#822a7f] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt={coupon.store?.name ?? 'Store'}
              className="w-9 h-9 rounded-lg bg-white p-0.5 object-contain"
            />
            <div>
              <p className="text-white font-semibold text-sm">{coupon.store?.name}</p>
              <p className="text-purple-200 text-xs line-clamp-1">{coupon.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <div className="text-center mb-4">
            {/* ✅ No extra OFF */}
            <p className="text-3xl font-extrabold text-[#822a7f]">{coupon.discount}</p>
            <p className="text-gray-400 text-sm">Best available offer</p>
          </div>

          <p className="text-xs text-gray-500 uppercase font-semibold mb-2 tracking-wide">
            Your Coupon Code
          </p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 border-2 border-dashed border-purple-300 rounded-xl px-4 py-3 text-center font-mono font-bold text-lg text-gray-800 tracking-widest bg-purple-50">
              {coupon.code}
            </div>
            <button
              onClick={() => onCopy(coupon)}
              className={`px-4 rounded-xl text-sm font-semibold transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
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
              🕐 Valid until{' '}
              {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}

          <a
            href={coupon.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#822a7f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6b2268] transition-colors"
          >
            🔗 Go to {coupon.store?.name} & Apply Code
          </a>

          {copied && (
            <p className="text-center text-xs text-gray-400 mt-3">
              The code has been copied. Paste it at checkout on the store website.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
