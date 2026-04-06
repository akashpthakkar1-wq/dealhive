import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json({ coupons: [], stores: [] })

  const supabase = createServerSupabaseClient()
  const like = `%${q}%`

  const [couponsRes, storesRes] = await Promise.all([
    supabase
      .from('coupons')
      .select('id,title,slug,discount,type,store:stores(name,slug,logo)')
      .or(`title.ilike.${like},description.ilike.${like},code.ilike.${like}`)
      .limit(8),
    supabase
      .from('stores')
      .select('id,name,slug,logo,category')
      .ilike('name', like)
      .limit(4),
  ])

  return NextResponse.json({
    coupons: couponsRes.data || [],
    stores: storesRes.data || [],
  })
}
