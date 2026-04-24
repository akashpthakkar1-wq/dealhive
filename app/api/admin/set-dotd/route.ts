import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET() {
  const { data, error } = await getClient().rpc('exec_dotd_get_all')
  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const { coupon_id, slot } = await req.json()
  if (!coupon_id) return NextResponse.json({ error: 'Missing coupon_id' }, { status: 400 })
  const supabase = getClient()
  if (slot) await supabase.rpc('exec_dotd_clear', { p_slot: slot, p_exclude_id: coupon_id })
  const { error } = await supabase.rpc('exec_dotd_set', { p_coupon_id: coupon_id, p_slot: slot ?? null })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
