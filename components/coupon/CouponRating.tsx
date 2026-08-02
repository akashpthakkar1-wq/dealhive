'use client';

import { useEffect, useRef, useState } from 'react';

type Stage = 'ask' | 'reason' | 'thanksYes' | 'thanksNo' | 'already';

const REASONS: { key: string; label: string }[] = [
  { key: 'expired', label: 'Code has expired' },
  { key: 'not_applicable', label: 'Not valid on my product' },
  { key: 'min_order', label: 'Minimum order not met' },
  { key: 'invalid', label: 'Code was invalid / not accepted' },
  { key: 'other', label: 'Something else' },
];

function alreadyVoted(couponId: string): boolean {
  try { return localStorage.getItem('eop_voted_' + couponId) === '1'; } catch { return false; }
}
function markVoted(couponId: string) {
  try { localStorage.setItem('eop_voted_' + couponId, '1'); } catch { /* ignore */ }
}

export default function CouponRating({ couponId, storeName }: { couponId: string; storeName?: string | null }) {
  const [stage, setStage] = useState<Stage>('ask');
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [animate, setAnimate] = useState(false);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (alreadyVoted(couponId)) { setStage('already'); return; }
    // Trigger the attention animation after a short delay, once they've seen the code.
    timerRef.current = setTimeout(() => setAnimate(true), 1600);
    return () => clearTimeout(timerRef.current);
  }, [couponId]);

  async function recordVote(didWork: boolean) {
    setBusy(true);
    markVoted(couponId);
    try {
      await fetch('/api/coupon-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId, didWork }),
      });
    } catch { /* fire-and-forget; UI proceeds regardless */ }
    setBusy(false);
  }

  function handleYes() {
    if (busy) return;
    recordVote(true);
    setStage('thanksYes');
  }

  function handleNo() {
    if (busy) return;
    recordVote(false);        // count the "didn't work" immediately
    setStage('reason');       // then ask why
  }

  async function submitReason() {
    setBusy(true);
    try {
      await fetch('/api/coupon-reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId, reason, details: details.trim() || null }),
      });
    } catch { /* ignore */ }
    setBusy(false);
    setStage('thanksNo');
  }

  const store = storeName || 'the store';

  if (stage === 'already') {
    return (
      <div className="mt-4 border-t border-gray-200 pt-3 text-center">
        <p className="text-xs text-gray-400">Thanks — you&apos;ve already shared your feedback on this code.</p>
      </div>
    );
  }

  if (stage === 'thanksYes') {
    return (
      <div className="mt-4 border-t border-gray-200 pt-4 text-center">
        <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <p className="text-sm font-semibold text-green-700 mb-0.5">Thank you</p>
        <p className="text-xs text-gray-500 leading-relaxed">You just helped the next shopper save with confidence. Happy shopping!</p>
      </div>
    );
  }

  if (stage === 'thanksNo') {
    return (
      <div className="mt-4 border-t border-gray-200 pt-4 text-center">
        <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-0.5">Thanks for the heads-up</p>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">We&apos;ll review this code right away. Meanwhile, try another working deal from the page.</p>
        <button
          onClick={() => { const url = new URL(window.location.href); url.searchParams.delete('popup'); window.history.replaceState({}, '', url.toString()); location.reload(); }}
          className="text-xs bg-[#EA580C] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#C2410C] transition-colors">
          See other {store} deals
        </button>
      </div>
    );
  }

  if (stage === 'reason') {
    return (
      <div className="mt-3 border-t border-gray-200 pt-3">
        <p className="text-xs font-semibold text-gray-700 text-center mb-2">Sorry it didn&apos;t work — what went wrong?</p>
        <div className="flex flex-col gap-1 mb-2">
          {REASONS.map((r) => (
            <label key={r.key} className={`flex items-center gap-2 px-2.5 py-1.5 border rounded-lg text-[13px] cursor-pointer transition-colors ${reason === r.key ? 'border-[#EA580C] bg-orange-50 text-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <input type="radio" name="reason" checked={reason === r.key} onChange={() => setReason(r.key)}
                className="w-3.5 h-3.5 accent-[#EA580C] flex-shrink-0" />
              {r.label}
            </label>
          ))}
        </div>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add details (optional)…"
          rows={1}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] resize-none focus:outline-none focus:border-[#EA580C] mb-2"
        />
        <button onClick={submitReason} disabled={busy}
          className="w-full bg-[#EA580C] text-white py-2 rounded-lg font-semibold text-sm hover:bg-[#C2410C] transition-colors disabled:opacity-50">
          {busy ? 'Submitting…' : 'Submit feedback'}
        </button>
      </div>
    );
  }

  // stage === 'ask'
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <p className="text-center text-sm text-gray-600 leading-relaxed mb-3">
        Best of luck with your purchase from {store}! Once you&apos;re done, let us know — did the code work as expected?
      </p>
      <div className="flex gap-2.5 justify-center">
        <div className="relative">
          <button onClick={handleYes} disabled={busy}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm font-semibold hover:bg-green-100 transition-colors disabled:opacity-50 ${animate ? 'eop-pulse' : ''}`}>
            👍 Yes, it worked
          </button>
          {animate && (
            <span className="eop-hand" aria-hidden="true">👆</span>
          )}
        </div>
        <button onClick={handleNo} disabled={busy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
          👎 No
        </button>
      </div>

      <style jsx>{`
        .eop-hand {
          position: absolute;
          right: 10px;
          bottom: -14px;
          font-size: 22px;
          pointer-events: none;
          animation: eopTap 2.4s ease-in-out 2;
        }
        @keyframes eopTap {
          0% { transform: translate(0,0) scale(1); opacity: 0; }
          15% { opacity: 1; }
          30% { transform: translate(-2px,-7px) scale(0.85); }
          45% { transform: translate(0,0) scale(1); }
          60% { transform: translate(-2px,-7px) scale(0.85); }
          75% { transform: translate(0,0) scale(1); }
          100% { transform: translate(0,0) scale(1); opacity: 0; }
        }
        .eop-pulse {
          animation: eopPulse 1.3s ease-in-out 2;
        }
        @keyframes eopPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
          50% { box-shadow: 0 0 0 6px rgba(22,163,74,0.18); }
        }
      `}</style>
    </div>
  );
}
