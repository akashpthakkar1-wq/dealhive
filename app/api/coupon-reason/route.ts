import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const VALID_REASONS = ['expired', 'not_applicable', 'min_order', 'invalid', 'other']

// Logs the REASON for a "didn't work" vote separately, WITHOUT re-counting the vote.
// The vote itself is already counted on the No-click via /api/coupon-vote.
// This row is marked vote='reason' so it never affects worked/didnt_work counts or the last-10 window.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const couponId: string | undefined = body.couponId
    let reason: string | null = typeof body.reason === 'string' ? body.reason : null
    const details: string | null = typeof body.details === 'string' ? body.details.slice(0, 500) : null

    if (!couponId || typeof couponId !== 'string') {
      return NextResponse.json({ error: 'couponId required' }, { status: 400 })
    }
    if (reason && !VALID_REASONS.includes(reason)) reason = 'other'
    if (!reason && !details) {
      return NextResponse.json({ ok: true, skipped: true }) // nothing to log
    }

    const { error } = await supabase.from('coupon_feedback').insert({
      coupon_id: couponId,
      vote: 'reason',
      reason,
      details,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Request failed' }, { status: 500 })
  }
}
