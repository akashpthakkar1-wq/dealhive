import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const VALID_REASONS = ['expired', 'not_applicable', 'min_order', 'invalid', 'other']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const couponId: string | undefined = body.couponId
    const didWork: boolean = body.didWork === true
    let reason: string | null = typeof body.reason === 'string' ? body.reason : null
    let details: string | null = typeof body.details === 'string' ? body.details.slice(0, 500) : null

    if (!couponId || typeof couponId !== 'string') {
      return NextResponse.json({ error: 'couponId required' }, { status: 400 })
    }

    // Sanitize: reason only applies to "didn't work" votes; must be a known value
    if (didWork) {
      reason = null
      details = null
    } else if (reason && !VALID_REASONS.includes(reason)) {
      reason = 'other'
    }

    const { error } = await supabase.rpc('record_vote', {
      cid: couponId,
      did_work: didWork,
      vote_reason: reason,
      vote_details: details,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Request failed' }, { status: 500 })
  }
}
