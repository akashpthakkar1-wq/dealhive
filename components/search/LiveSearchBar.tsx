'use client';

import { useState, useRef, useEffect } from 'react';
import { getCouponLogo, getStoreLogo } from '@/lib/logos'
import { Search } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { Coupon, Store } from '@/types/index';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Logo helpers ─────────────────────────────────────────────────────────────
}
function getCouponLogo(c: Coupon) {
  if (c.store?.logo) return c.store.logo;
  if (c.store?.website_url) return getLogoFromUrl(c.store.website_url);
  if (c.affiliate_url) return getLogoFromUrl(c.affiliate_url);
  return '/placeholder-logo.png';
}
function getStoreLogo(s: Store) {
  if (s.logo) return s.logo;
  if (s.website_url) return getLogoFromUrl(s.website_url);
  return '/placeholder-logo.png';
}

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

interface Props {
  variant?: 'navbar' | 'hero';
  placeholder?: string;
}

export default function LiveSearchBar({
  variant = 'navbar',
  placeholder = 'Search stores, coupons, deals...',
}: Props) {
  const [query, setQuery] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ── Load all data once (lazy — only when user focuses) ────────────────────
  async function loadData() {
    if (loaded) return;
    const [{ data: cData }, { data: sData }] = await Promise.all([
      supabase.from('coupons').select('*, store:stores(*)').order('created_at', { ascending: false }),
      supabase.from('stores').select('*').order('name'),
    ]);
    if (cData) setCoupons(cData as Coupon[]);
    if (sData) setStores(sData as Store[]);
    setLoaded(true);
  }

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Filtered results ──────────────────────────────────────────────────────
  const q = query.trim().toLowerCase();
  const matchStores = q ? stores.filter(s => s.name.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchCoupons = q
    ? coupons.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.store?.name ?? '').toLowerCase().includes(q)
      ).slice(0, 6)
    : [];
  const hasResults = matchStores.length > 0 || matchCoupons.length > 0;

  // ── Styles per variant ────────────────────────────────────────────────────
  const isHero = variant === 'hero';

  return (
    <div ref={ref} className={`relative ${isHero ? 'w-full max-w-xl mx-auto' : 'w-full'}`}>
      {isHero ? (
        /* ── Hero variant ── */
        <div className="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden">
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            className="flex-1 px-5 py-3.5 text-gray-800 text-base outline-none bg-transparent placeholder-gray-400 min-w-0"
            onFocus={() => { loadData(); if (q) setOpen(true); }}
            onChange={(e) => { setQuery(e.target.value); setOpen(e.target.value.trim().length > 0); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                setOpen(false);
                window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
              }
            }}
          />
          {query && (
            <button onMouseDown={(e) => { e.preventDefault(); setQuery(''); setOpen(false); }}
              className="px-3 text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0">
              ×
            </button>
          )}
          <button
            onMouseDown={(e) => { e.preventDefault(); setOpen(false); if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`; }}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3.5 text-sm transition-colors flex-shrink-0"
          >
            Search
          </button>
        </div>
      ) : (
        /* ── Navbar variant ── */
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-gray-50"
            onFocus={() => { loadData(); if (q) setOpen(true); }}
            onChange={(e) => { setQuery(e.target.value); setOpen(e.target.value.trim().length > 0); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                setOpen(false);
                window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
              }
            }}
          />
        </div>
      )}

      {/* ── Dropdown ── */}
      {open && query.trim().length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 text-left overflow-hidden"
          style={{ maxHeight: '400px', overflowY: 'auto' }}
        >
          {!loaded ? (
            <div className="px-5 py-6 text-center text-sm text-gray-400">Searching...</div>
          ) : !hasResults ? (
            <div className="px-5 py-6 text-center text-sm text-gray-400">
              No results for <strong className="text-gray-600">"{query}"</strong>
            </div>
          ) : (
            <>
              {/* Stores */}
              {matchStores.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1.5 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                    Stores
                  </p>
                  {matchStores.map((store) => (
                    <button
                      key={store.id}
                      onMouseDown={(e) => { e.preventDefault(); setOpen(false); window.location.href = `/store/${store.slug}`; }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                    >
                      <img src={getStoreLogo(store)} alt={`${store.name} logo`}
                        className="w-8 h-8 rounded-lg border border-gray-100 object-contain bg-white flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          <Highlight text={store.name} query={query} />
                        </p>
                        {store.category && <p className="text-xs text-gray-400">{store.category}</p>}
                      </div>
                      <span className="text-xs text-primary-600 font-semibold flex-shrink-0">View →</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Coupons */}
              {matchCoupons.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1.5 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                    Coupons & Deals
                  </p>
                  {matchCoupons.map((coupon) => (
                    <button
                      key={coupon.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        window.location.href = `/search?q=${encodeURIComponent(coupon.title)}`;
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                    >
                      <img src={getCouponLogo(coupon)} alt={coupon.store?.name ?? 'Store'}
                        className="w-8 h-8 rounded-lg border border-gray-100 object-contain bg-white flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          <Highlight text={coupon.title} query={query} />
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {coupon.store?.name}
                          {coupon.discount && <span className="ml-1.5 font-semibold text-primary-600">· {coupon.discount}</span>}
                        </p>
                      </div>
                      <span className={`flex-shrink-0 text-[11px] font-bold px-2 py-1 rounded-full ${
                        coupon.type === 'code' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
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
  );
}
