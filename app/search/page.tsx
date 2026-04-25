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
                  className="px-3 text-gray-500 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
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
                  <div className="px-5 py-6 text-center text-sm text-gray-500">
                    Loading...
                  </div>
                ) : !hasResults ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-gray-500 text-sm">
                      No results for{' '}
                      <strong className="text-gray-600">"{inputValue}"</strong>
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Stores section */}
                    {dropdownStores.length > 0 && (
                      <div>
                        <p className="px-4 pt-3 pb-1.5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
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
                                <p className="text-xs text-gray-500">{store.category}</p>
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
                        <p className="px-4 pt-3 pb-1.5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
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
                              <p className="text-xs text-gray-500 truncate">
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
            <p className="text-gray-500 text-sm">Loading deals...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-semibold text-lg mb-1">No deals found</p>
            <p className="text-gray-500 text-sm">Try a different search term or filter</p>
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


    </main>
  );
}

// ─── Coupon Card ──────────────────────────────────────────────────────────────
