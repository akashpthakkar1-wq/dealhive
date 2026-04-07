'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Coupon, Store } from '@/types/index';

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

// ─── Logo helper ──────────────────────────────────────────────────────────────
function getLogoUrl(coupon: Coupon): string {
  if (coupon.store?.logo) return coupon.store.logo;
  const domain = coupon.store?.website_url || coupon.affiliate_url || '';
  try {
    const hostname = new URL(domain).hostname.replace('www.', '');
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch { return '/placeholder-logo.png'; }
}

function getStoreLogoUrl(store: Store): string {
  if (store.logo) return store.logo;
  const domain = store.website_url || '';
  try {
    const hostname = new URL(domain).hostname.replace('www.', '');
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch { return '/placeholder-logo.png'; }
}

// ─── Highlight matching text ──────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownQuery, setDropdownQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f) setFilter(f);
    const q = params.get('q');
    if (q) { setSearch(q); setDropdownQuery(q); }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: cData }, { data: sData }] = await Promise.all([
      supabase.from('coupons').select('*, store:stores(*)').order('created_at', { ascending: false }),
      supabase.from('stores').select('*').order('name'),
    ]);
    if (cData) setCoupons(cData as Coupon[]);
    if (sData) setStores(sData as Store[]);
    setLoading(false);
  }

  // ── Dropdown search results (live, every keystroke) ──────────────────────
  const dropdownStores = dropdownQuery.trim()
    ? stores.filter(s => s.name.toLowerCase().includes(dropdownQuery.toLowerCase())).slice(0, 4)
    : [];

  const dropdownCoupons = dropdownQuery.trim()
    ? coupons.filter(c =>
        c.title.toLowerCase().includes(dropdownQuery.toLowerCase()) ||
        (c.store?.name ?? '').toLowerCase().includes(dropdownQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const hasDropdownResults = dropdownStores.length > 0 || dropdownCoupons.length > 0;

  // ── Main grid filter ──────────────────────────────────────────────────────
  const filtered = coupons.filter((c) => {
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

  function handleGetCode(coupon: Coupon) {
    // Open current page in new tab, navigate THIS tab to affiliate
    window.open(window.location.href, '_blank');
    window.location.href = coupon.affiliate_url;
    setModalCoupon(coupon);
  }

  function handleActivateDeal(coupon: Coupon) {
    // Open current page in new tab, navigate THIS tab to affiliate
    window.open(window.location.href, '_blank');
    window.location.href = coupon.affiliate_url;
    setModalCoupon(coupon);
  }

  // When user picks a result from dropdown
  function selectDropdownCoupon(coupon: Coupon) {
    setDropdownOpen(false);
    setDropdownQuery(coupon.title);
    setSearch(coupon.title);
  }

  function selectDropdownStore(store: Store) {
    setDropdownOpen(false);
    window.location.href = `/store/${store.slug}`;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Header with live search ── */}
      <div className="bg-[#822a7f] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">New Deals & Coupons</h1>
          <p className="text-purple-200 mb-6">Latest verified coupon codes and deals — updated daily</p>

          {/* Search box + live dropdown */}
          <div ref={searchRef} className="relative w-full max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search stores or deals..."
              value={dropdownQuery}
              onChange={(e) => {
                const val = e.target.value;
                setDropdownQuery(val);
                setSearch(val);
                setDropdownOpen(val.trim().length > 0);
              }}
              onFocus={() => {
                if (dropdownQuery.trim().length > 0) setDropdownOpen(true);
              }}
              className="w-full px-5 py-3.5 rounded-xl text-gray-800 text-base outline-none shadow-lg pr-12"
            />
            {dropdownQuery && (
              <button
                onClick={() => { setDropdownQuery(''); setSearch(''); setDropdownOpen(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
              >×</button>
            )}

            {/* ── Live dropdown ── */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[420px] overflow-y-auto text-left">
                {!hasDropdownResults ? (
                  <div className="px-5 py-6 text-center text-gray-400 text-sm">
                    No results found for "<strong>{dropdownQuery}</strong>"
                  </div>
                ) : (
                  <>
                    {/* Stores section */}
                    {dropdownStores.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Stores
                        </div>
                        {dropdownStores.map((store) => (
                          <button
                            key={store.id}
                            onMouseDown={() => selectDropdownStore(store)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors"
                          >
                            <img
                              src={getStoreLogoUrl(store)}
                              alt={store.name}
                              className="w-8 h-8 rounded-lg border border-gray-100 object-contain bg-white flex-shrink-0"
                            />
                            <span className="text-sm font-semibold text-gray-800">
                              <Highlight text={store.name} query={dropdownQuery} />
                            </span>
                            <span className="ml-auto text-xs text-gray-400">View store →</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Coupons section */}
                    {dropdownCoupons.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50">
                          Coupons & Deals
                        </div>
                        {dropdownCoupons.map((coupon) => (
                          <button
                            key={coupon.id}
                            onMouseDown={() => selectDropdownCoupon(coupon)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors"
                          >
                            <img
                              src={getLogoUrl(coupon)}
                              alt={coupon.store?.name ?? 'Store'}
                              className="w-8 h-8 rounded-lg border border-gray-100 object-contain bg-white flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                <Highlight text={coupon.title} query={dropdownQuery} />
                              </p>
                              <p className="text-xs text-gray-400 truncate">{coupon.store?.name}</p>
                            </div>
                            <span className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              coupon.type === 'code'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-orange-100 text-orange-600'
                            }`}>
                              {coupon.type === 'code' ? 'Show Code' : 'Get Deal'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
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
          // ✅ Equal-height 2-col grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {filtered.map((coupon) => (
              <SearchCouponCard
                key={coupon.id}
                coupon={coupon}
                onGetCode={handleGetCode}
                onActivateDeal={handleActivateDeal}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Popup Modal ── */}
      {modalCoupon && (
        <CouponModal
          coupon={modalCoupon}
          onClose={() => setModalCoupon(null)}
        />
      )}
    </main>
  );
}

// ─── Search Coupon Card ───────────────────────────────────────────────────────
function SearchCouponCard({
  coupon,
  onGetCode,
  onActivateDeal,
}: {
  coupon: Coupon;
  onGetCode: (c: Coupon) => void;
  onActivateDeal: (c: Coupon) => void;
}) {
  const logoUrl = getLogoUrl(coupon);

  return (
    // h-full + flex flex-col = equal height in grid
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      <div className="flex flex-1">

        {/* Left discount badge — desktop only */}
        <div className="hidden sm:flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100/60 w-[88px] flex-shrink-0 text-center border-r border-purple-100 px-2">
          <span className="text-sm font-extrabold text-[#822a7f] leading-tight break-words w-full text-center">
            {coupon.discount}
          </span>
          <span className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
            coupon.type === 'code' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
          }`}>
            {coupon.type}
          </span>
        </div>

        {/* Main content — flex col so CTA anchors to bottom */}
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
                {/* Mobile discount badge */}
                <span className="sm:hidden ml-auto text-xs font-extrabold text-[#822a7f] bg-purple-50 border border-purple-200 px-2 py-px rounded-full whitespace-nowrap">
                  {coupon.discount}
                </span>
              </div>
              {/* Title clamped — won't break layout */}
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">
                {coupon.title}
              </p>
            </div>
          </div>

          {/* Row 2: Meta — flex-1 pushes CTA down */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-400 flex-1">
            {coupon.expiry_date && (
              <span>🕐 Expires {new Date(coupon.expiry_date).toLocaleDateString('en-IN')}</span>
            )}
            {coupon.usage_count > 0 && (
              <span>👥 {coupon.usage_count.toLocaleString()} used</span>
            )}
          </div>

          {/* Row 3: CTA — mt-auto always at bottom */}
          <div className="mt-auto pt-3">
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
              <button
                onClick={() => onActivateDeal(coupon)}
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

// ─── Coupon Modal ─────────────────────────────────────────────────────────────
function CouponModal({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const logoUrl = getLogoUrl(coupon);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
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
            className="text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 leading-none"
          >×</button>
        </div>

        <div className="p-5">
          {/* Discount value */}
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
                <button
                  onClick={handleCopy}
                  className={`px-4 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                    copied
                      ? 'bg-green-500 text-white scale-95'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
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
                  🕐 Valid until{' '}
                  {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}

              <button
                onClick={handleGoToStore}
                className="w-full text-center bg-[#822a7f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6b2268] transition-colors"
              >
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

              {/* Auto-apply message */}
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <span className="text-green-500 text-lg flex-shrink-0">✅</span>
                <p className="text-sm text-green-700 font-medium">
                  Discount will be applied automatically on the store page. No code needed!
                </p>
              </div>

              {coupon.expiry_date && (
                <p className="text-xs text-gray-400 mb-4">
                  🕐 Valid until{' '}
                  {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}

              <button
                onClick={handleGoToStore}
                className="w-full text-center bg-[#822a7f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6b2268] transition-colors"
              >
                🛒 Go to {coupon.store?.name}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
