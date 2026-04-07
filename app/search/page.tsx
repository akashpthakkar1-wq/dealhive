'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Adjust these env vars to match your project
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Coupon {
  id: string;
  store_name: string;
  title: string;
  code: string | null;
  discount_value: string;
  discount_type: string;
  type: 'code' | 'deal';
  expiry_date: string;
  used_count: number;
  is_verified: boolean;
  is_featured: boolean;
  is_trending: boolean;
  affiliate_url: string;
  created_at: string;
}

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
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});
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
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCoupons(data as Coupon[]);
    setLoading(false);
  }

  function handleGetCode(coupon: Coupon) {
    // Open affiliate URL in current tab
    window.location.href = coupon.affiliate_url;
    // Show popup
    setModalCoupon(coupon);
    if (coupon.code) {
      navigator.clipboard.writeText(coupon.code).catch(() => {});
    }
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
    const matchSearch =
      search === '' ||
      c.store_name.toLowerCase().includes(search.toLowerCase()) ||
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
        <div className="max-w-4xl mx-auto text-center">
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

      <div className="max-w-4xl mx-auto px-4 py-6">
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
          <div className="space-y-3">
            {filtered.map((coupon) => (
              <CouponCard
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

// ─── Coupon Card (Mobile-optimised) ───────────────────────────────────────────
function CouponCard({
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
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${getDomain(coupon.affiliate_url)}&sz=64`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Mobile: stacked layout | Desktop: row layout */}
      <div className="flex flex-col sm:flex-row">
        {/* Left badge – hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex flex-col items-center justify-center bg-purple-50 px-5 min-w-[100px] text-center">
          <span className="text-2xl font-extrabold text-[#822a7f] leading-tight">
            {coupon.discount_value}
          </span>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
            OFF
          </span>
          <span className="mt-1 text-[10px] bg-purple-100 text-[#822a7f] px-2 py-0.5 rounded-full font-semibold uppercase">
            {coupon.type}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Top row: logo + store + mobile badge */}
          <div className="flex items-start gap-3">
            <img
              src={faviconUrl}
              alt={coupon.store_name}
              className="w-9 h-9 rounded-lg flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500">
                  {coupon.store_name}
                </span>
                {coupon.is_verified && (
                  <span className="text-[11px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                    ✅ Verified
                  </span>
                )}
                {/* Mobile-only discount badge */}
                <span className="sm:hidden ml-auto text-xs font-bold text-[#822a7f] bg-purple-50 px-2 py-0.5 rounded-full">
                  {coupon.discount_value} OFF
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug line-clamp-2">
                {coupon.title}
              </p>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
            <span>🕐 Expires {coupon.expiry_date}</span>
            <span>👥 {coupon.used_count?.toLocaleString()} used</span>
          </div>

          {/* CTA button */}
          <div className="mt-3">
            {coupon.type === 'code' ? (
              <button
                onClick={() => onGetCode(coupon)}
                className="w-full sm:w-auto flex items-center justify-center rounded-xl overflow-hidden text-sm font-semibold shadow-sm"
              >
                <span className="bg-[#822a7f] text-white px-5 py-2.5 flex-1 sm:flex-none text-center">
                  Get Code
                </span>
                <span className="bg-[#6b2268] text-white px-3 py-2.5 border-l border-purple-600 font-mono tracking-wider">
                  {coupon.code?.slice(0, 4)}•••
                </span>
              </button>
            ) : (
              <a
                href={coupon.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full sm:w-auto text-center bg-[#822a7f] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6b2268] transition-colors"
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#822a7f] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`https://www.google.com/s2/favicons?domain=${getDomain(coupon.affiliate_url)}&sz=64`}
              alt={coupon.store_name}
              className="w-9 h-9 rounded-lg bg-white p-0.5"
            />
            <div>
              <p className="text-white font-semibold text-sm">{coupon.store_name}</p>
              <p className="text-purple-200 text-xs">{coupon.title.slice(0, 40)}…</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">
            ×
          </button>
        </div>

        <div className="p-5">
          <div className="text-center mb-4">
            <p className="text-3xl font-extrabold text-[#822a7f]">{coupon.discount_value} OFF</p>
            <p className="text-gray-400 text-sm">Best available offer</p>
          </div>

          <p className="text-xs text-gray-500 uppercase font-semibold mb-2 tracking-wide">Your Coupon Code</p>
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

          <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 mb-3">
            {coupon.title}
          </div>
          <p className="text-xs text-gray-400 mb-4">🕐 Valid until {coupon.expiry_date}</p>

          <a
            href={coupon.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#822a7f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6b2268] transition-colors"
          >
            🔗 Go to {coupon.store_name} & Apply Code
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

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

