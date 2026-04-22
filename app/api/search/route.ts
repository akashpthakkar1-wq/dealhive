import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  if (!q || q.length < 2) return NextResponse.json({ coupons: [], stores: [] })

  const supabase = createServerSupabaseClient()
  const like = `%${q}%`

  const [couponsRes, storesRes] = await Promise.all([
    supabase
      .from('coupons')
      .select('*, store:stores(id, name, slug, logo, website_url, category)')
      .or(`title.ilike.${like},description.ilike.${like},code.ilike.${like}`)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('stores')
      .select('id, name, slug, logo, website_url, category')
      .ilike('name', like)
      .limit(8),
  ])

  return NextResponse.json({
    coupons: couponsRes.data || [],
    stores: storesRes.data || [],
  })
}
