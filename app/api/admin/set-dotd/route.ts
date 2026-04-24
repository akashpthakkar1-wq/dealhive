import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { coupon_id, slot } = await req.json()
  if (!coupon_id) return NextResponse.json({ error: 'Missing coupon_id' }, { status: 400 })
  const supabase = createServerSupabaseClient()
  if (slot) {
    await supabase.from('coupons').update({ deal_of_the_day_order: null } as any).eq('deal_of_the_day_order', slot).neq('id', coupon_id)
  }
  const { error } = await supabase.from('coupons').update({ deal_of_the_day_order: slot ?? null } as any).eq('id', coupon_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
