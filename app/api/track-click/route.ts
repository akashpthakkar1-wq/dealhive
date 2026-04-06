import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { coupon_id } = await req.json()
    if (!coupon_id) return NextResponse.json({ error: 'coupon_id required' }, { status: 400 })

    const supabase = createAdminSupabaseClient()
    await supabase.from('clicks').insert({
      coupon_id,
      clicked_at: new Date().toISOString(),
      user_agent: req.headers.get('user-agent'),
    })

    // Increment usage_count
    await supabase.rpc('increment_usage', { coupon_id })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
