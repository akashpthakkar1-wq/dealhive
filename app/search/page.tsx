'use client';

import { useEffect, useState, useRef } from 'react';
import { getCouponLogo, getStoreLogo } from '@/lib/logos'
import { createClient } from '@supabase/supabase-js';
import type { Coupon, Store } from '@/types/index';
import SharedCouponCard from '@/components/coupon/CouponCard';



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


// ─── Highlight matching text ──────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded-sm px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [inputValue, setInputValue] = useState('');
  const [gridSearch, setGridSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Read URL params on mount ───────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f) setFilter(f);
    const q = params.get('q');
    if (q) { setInputValue(q); setGridSearch(q); }
  }, []);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  // ── Fetch data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setFetchError(null);

      // ✅ Use simple * select — avoids column name mismatch errors
      const { data: cData, error: cErr } = await supabase
        .from('coupons')
        .select('*, store:stores(*)')
        .order('created_at', { ascending: false });

      if (cErr) {
        console.error('❌ Coupons error:', cErr);
        setFetchError(cErr.message);
        setLoading(false);
        return;
      }

      const { data: sData, error: sErr } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (sErr) console.error('❌ Stores error:', sErr);

      const loadedCoupons = (cData ?? []) as Coupon[];
      const loadedStores = (sData ?? []) as Store[];

      setCoupons(loadedCoupons);
      setStores(loadedStores);

      // ✅ Read popup ID directly from URL — no sessionStorage needed
      // sessionStorage is NOT shared between browser tabs
      const params = new URLSearchParams(window.location.search);
      const popupId = params.get('popup');
      if (popupId) {
        const found = loadedCoupons.find((c) => c.id === popupId);
        if (found) setModalCoupon(found);
      }

      setLoading(false);
    }

    fetchAll();
  }, []);

  // ── Dropdown computed values (recalculated every keystroke) ───────────────
  const q = inputValue.trim().toLowerCase();

  const dropdownStores = q.length > 0
    ? stores.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const dropdownCoupons = q.length > 0
    ? coupons.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        (c.store?.name ?? '').toLowerCase().includes(q)
      ).slice(0, 6)
    : [];

  const hasResults = dropdownStores.length > 0 || dropdownCoupons.length > 0;

  // ── Grid filter ────────────────────────────────────────────────────────────
  const gs = gridSearch.trim().toLowerCase();
  const filtered = coupons.filter((c) => {
    const matchSearch = !gs ||
      c.title.toLowerCase().includes(gs) ||
      (c.store?.name ?? '').toLowerCase().includes(gs);
    const matchFilter =
      filter === 'all' ||
      (filter === 'code' && c.type === 'code') ||
      (filter === 'deal' && c.type === 'deal') ||
      (filter === 'verified' && c.is_verified) ||
      (filter === 'featured' && c.is_featured) ||
      (filter === 'trending' && c.is_trending);
    return matchSearch && matchFilter;
  });

  // ── CTA click handler ──────────────────────────────────────────────────────
  // ✅ CORRECT FLOW:
  // 1. Open NEW tab → /search?popup=COUPON_ID  (popup auto-shows here)
  // 2. Navigate THIS tab → affiliate URL
  function handleCTA(coupon: Coupon) {
    const newTabUrl = `${window.location.origin}/search?popup=${encodeURIComponent(coupon.id)}`;
    window.open(newTabUrl, '_blank');           // new tab: EndOverPay with popup
    window.location.href = coupon.affiliate_url; // this tab: goes to store
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-[#EA580C] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">New Deals & Coupons</h1>
          <p className="text-orange-200 mb-6">
            Latest verified coupon codes and deals — updated daily
          </p>

          {/* ── Search box with live dropdown ── */}
          <div ref={searchRef} className="relative w-full max-w-xl mx-auto">
            <div className="flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputValue(val);
                  setGridSearch(val);
                  // Show dropdown only when there is text
                  setDropdownOpen(val.trim().length > 0);
                }}
                onFocus={() => {
                  if (inputValue.trim().length > 0) setDropdownOpen(true);
                }}
                placeholder="Search stores or deals..."
                className="flex-1 px-5 py-3.5 text-gray-800 text-base outline-none bg-transparent placeholder-gray-400 min-w-0"
                autoComplete="off"
                spellCheck={false}
              />
              {inputValue.length > 0 && (
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setInputValue('');
                    setGridSearch('');
                    setDropdownOpen(false);
                  }}
                  className="px-3 text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
                >×</button>
              )}
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setGridSearch(inputValue);
                  setDropdownOpen(false);
                }}
                className="bg-[#C2410C] hover:bg-[#5a1d57] text-white px-5 py-3.5 text-sm font-bold transition-colors flex-shrink-0"
              >
                Search
              </button>
            </div>

            {/* ── Dropdown ── */}
            {dropdownOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 text-left"
                style={{ maxHeight: '420px', overflowY: 'auto' }}
              >
                {loading ? (
                  <div className="px-5 py-6 text-center text-sm text-gray-400">
                    Loading...
                  </div>
                ) : !hasResults ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-gray-400 text-sm">
                      No results for{' '}
                      <strong className="text-gray-600">"{inputValue}"</strong>
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Stores section */}
                    {dropdownStores.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1.5 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                          Stores
                        </p>
                        {dropdownStores.map((store) => (
                          <button
                            key={store.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setDropdownOpen(false);
                              window.location.href = `/store/${store.slug}`;
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                          >
                            <img
                              src={getStoreLogo(store.website_url)}
                              alt={`${store.name} logo`}
                              className="w-9 h-9 rounded-lg border border-gray-100 object-contain bg-white flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">
                                <Highlight text={store.name} query={inputValue} />
                              </p>
                              {store.category && (
                                <p className="text-xs text-gray-400">{store.category}</p>
                              )}
                            </div>
                            <span className="text-xs text-[#EA580C] font-semibold flex-shrink-0">
                              View →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Coupons & Deals section */}
                    {dropdownCoupons.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1.5 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                          Coupons & Deals
                        </p>
                        {dropdownCoupons.map((coupon) => (
                          <button
                            key={coupon.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setDropdownOpen(false);
                              setInputValue(coupon.title);
                              setGridSearch(coupon.title);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                          >
                            <img
                              src={getCouponLogo(coupon)}
                              alt={coupon.store?.name ?? 'Store'}
                              className="w-9 h-9 rounded-lg border border-gray-100 object-contain bg-white flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                <Highlight text={coupon.title} query={inputValue} />
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {coupon.store?.name}
                                {coupon.discount && (
                                  <span className="ml-1.5 font-semibold text-[#EA580C]">
                                    · {coupon.discount}
                                  </span>
                                )}
                              </p>
                            </div>
                            <span className={`flex-shrink-0 text-[11px] font-bold px-2 py-1 rounded-full ${
                              coupon.type === 'code'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
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

      {/* ── Filter tabs + Grid ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-[#EA580C] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#EA580C] hover:text-[#EA580C]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Error state */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 text-sm">
            <strong>Error loading deals:</strong> {fetchError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading deals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-semibold text-lg mb-1">No deals found</p>
            <p className="text-gray-400 text-sm">Try a different search term or filter</p>
          </div>
        ) : (
          // ✅ Equal-height 2-col grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {filtered.map((coupon) => (
              <SharedCouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </div>

      {/* ── Popup modal ── */}
      {modalCoupon && (
        <CouponModal coupon={modalCoupon} onClose={() => setModalCoupon(null)} />
      )}
    </main>
  );
}

// ─── Coupon Card ──────────────────────────────────────────────────────────────
function CouponCard({ coupon, onCTA }: { coupon: Coupon; onCTA: (c: Coupon) => void }) {
  const logo = getCouponLogo(coupon);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      <div className="flex flex-1">
        {/* Left discount badge — desktop only */}
        <div className="hidden sm:flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-orange-100/60 w-[88px] flex-shrink-0 text-center border-r border-orange-100 px-2">
          <span className="text-sm font-extrabold text-[#EA580C] leading-tight break-words w-full text-center">
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
          {/* Logo + store name + badges */}
          <div className="flex items-start gap-3">
            <img
              src={logo}
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
                <span className="sm:hidden ml-auto text-xs font-extrabold text-[#EA580C] bg-orange-50 border border-orange-200 px-2 py-px rounded-full whitespace-nowrap">
                  {coupon.discount}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">
                {coupon.title}
              </p>
            </div>
          </div>

          {/* Meta — flex-1 fills space, pushes CTA down */}
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
                onClick={() => onCTA(coupon)}
                className="inline-flex items-center rounded-xl overflow-hidden text-sm font-semibold shadow-sm active:scale-95 transition-transform"
              >
                <span className="bg-[#EA580C] text-white px-5 py-2.5 hover:bg-[#C2410C] transition-colors">
                  Get Code
                </span>
                <span className="bg-[#C2410C] text-orange-200 px-3 py-2.5 font-mono text-xs tracking-wider border-l border-orange-600">
                  {coupon.code?.slice(0, 4) ?? '????'}•••
                </span>
              </button>
            ) : (
              <button
                onClick={() => onCTA(coupon)}
                className="inline-flex items-center bg-[#EA580C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C2410C] active:scale-95 transition-all"
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
  const logo = getCouponLogo(coupon);
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
        <div className="bg-[#EA580C] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={logo}
              alt={coupon.store?.name ?? 'Store'}
              className="w-9 h-9 rounded-lg bg-white p-0.5 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{coupon.store?.name}</p>
              <p className="text-orange-200 text-xs line-clamp-1">{coupon.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 flex-shrink-0 ml-3"
          >×</button>
        </div>

        <div className="p-5">
          <div className="text-center mb-5">
            <p className="text-3xl font-extrabold text-[#EA580C]">{coupon.discount}</p>
            <p className="text-gray-400 text-sm mt-0.5">Best available offer</p>
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
                <button
                  onClick={handleCopy}
                  className={`px-4 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="w-full text-center bg-[#EA580C] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C2410C] transition-colors"
              >
                🔗 Go to {coupon.store?.name} & Apply Code
              </button>
              {copied && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Code copied! Paste it at checkout.
                </p>
              )}
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
                <p className="text-xs text-gray-400 mb-4">
                  🕐 Valid until{' '}
                  {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
              <button
                onClick={handleGoToStore}
                className="w-full text-center bg-[#EA580C] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#C2410C] transition-colors"
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
