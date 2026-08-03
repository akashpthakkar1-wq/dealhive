import type { Coupon } from '@/types/index'

const VOTE_THRESHOLD = 5              // ranking by performance only kicks in at 5+ votes
const RECENT_HIGHLIGHT_COUNT = 2      // top N most-recently-added get the "recently added" highlight
const VERIFIED_FRESH_DAYS = 90        // below 5 worked votes, show verified date only if <= 90 days old

export type RankedCoupon = Coupon & {
  _recentlyAdded?: boolean            // one of the 2 newest -> highlight + boost
  _last10Score?: number               // worked ratio over last 10 votes (only when 5+ votes)
  _autoTrending?: boolean             // store's single highest-discount coupon
  _autoFeatured?: boolean             // store's single latest-verified coupon (not the trending one)
}

// The public "verified" date = most recent of manual verified_at OR latest user "worked" confirmation.
export function verifiedDate(c: Coupon): Date | null {
  const a = c.verified_at ? new Date(c.verified_at) : null
  const b = c.last_user_confirmed_at ? new Date(c.last_user_confirmed_at) : null
  if (a && b) return a > b ? a : b
  return a || b
}

function daysSince(d: Date): number {
  return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
}

// What trust signal to show publicly, per the spec.
export type TrustDisplay =
  | { mode: 'confirmed'; workedCount: number; date: Date }   // 5+ worked: count + verified date + badge
  | { mode: 'verified'; date: Date }                          // <5 worked, date <= 90 days: date + badge
  | { mode: 'none' }                                          // <5 worked, no fresh date: nothing

export function trustDisplay(c: Coupon): TrustDisplay {
  const worked = c.worked_count || 0
  const vd = verifiedDate(c)
  if (worked >= VOTE_THRESHOLD && vd) {
    return { mode: 'confirmed', workedCount: worked, date: vd }
  }
  if (vd && daysSince(vd) <= VERIFIED_FRESH_DAYS) {
    return { mode: 'verified', date: vd }
  }
  return { mode: 'none' }
}

// recentVotes: map of couponId -> array of booleans (true=worked), most-recent-first, capped at ~10.
export function rankCoupons(coupons: Coupon[], recentVotes: Record<string, boolean[]>): RankedCoupon[] {
  const list: RankedCoupon[] = coupons.map((c) => ({ ...c }))

  // Tag the 2 most-recently-added (by created_at) as recently-added.
  const byNewest = [...list].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const recentIds = new Set(byNewest.slice(0, RECENT_HIGHLIGHT_COUNT).map((c) => c.id))

  // Auto Trending = single highest-discount coupon. Auto Featured = single latest-verified
  // coupon that is NOT the trending one (Trending wins if same). Featured = none if no verified.
  const parseDiscount = (c: Coupon): number => {
    const m = (c.discount || '').match(/(\d+(?:\.\d+)?)/)
    return m ? parseFloat(m[1]) : -1
  }
  let trendingId: string | null = null
  let bestDisc = -1
  for (const c of list) {
    const d = parseDiscount(c)
    if (d > bestDisc) { bestDisc = d; trendingId = c.id }
  }
  let featuredId: string | null = null
  let bestVer = 0
  for (const c of list) {
    if (c.id === trendingId) continue
    const vd = verifiedDate(c)
    if (vd && vd.getTime() > bestVer) { bestVer = vd.getTime(); featuredId = c.id }
  }

  for (const c of list) {
    if (recentIds.has(c.id)) c._recentlyAdded = true
    if (c.id === trendingId) c._autoTrending = true
    if (c.id === featuredId) c._autoFeatured = true
    // last-10 worked ratio, only meaningful at threshold
    const votes = recentVotes[c.id] || []
    if ((c.vote_count || 0) >= VOTE_THRESHOLD && votes.length > 0) {
      const last10 = votes.slice(0, 10)
      c._last10Score = last10.filter(Boolean).length / last10.length
    }
  }

  function tier(c: RankedCoupon): number {
    if (c.manual_priority != null) return 0          // manual pins first
    if (c._recentlyAdded) return 1                    // then recently-added (boosted to top)
    if ((c.vote_count || 0) >= VOTE_THRESHOLD) return 2 // then proven (5+ votes)
    return 3                                          // then the rest (<5 votes)
  }

  return list.sort((a, b) => {
    const ta = tier(a), tb = tier(b)
    if (ta !== tb) return ta - tb

    if (ta === 0) {
      // higher manual_priority first
      return (b.manual_priority || 0) - (a.manual_priority || 0)
    }
    if (ta === 1) {
      // recently-added: newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (ta === 2) {
      // proven: by last-10 worked score desc, then by worked_count desc
      const sa = a._last10Score ?? 0, sb = b._last10Score ?? 0
      if (sb !== sa) return sb - sa
      return (b.worked_count || 0) - (a.worked_count || 0)
    }
    // tier 3 (<5 votes): by verified/recency — most recent verified date first, then newest
    const va = verifiedDate(a), vb = verifiedDate(b)
    const da = va ? va.getTime() : 0, db = vb ? vb.getTime() : 0
    if (db !== da) return db - da
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}
