import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Affiliate click logger. Logs the click to Supabase, then 302-redirects
// to the merchant/affiliate URL. The chat widget points deal buttons here
// so attribution always fires before any code is revealed.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dealId = searchParams.get('d')
  const to = searchParams.get('to')

  let dest: string | null = null
  if (to) {
    try {
      const decoded = decodeURIComponent(to)
      const u = new URL(decoded)
      if (u.protocol === 'http:' || u.protocol === 'https:') dest = decoded
    } catch {
      dest = null
    }
  }

  if (dealId) {
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await sb.from('clicks').insert({
        coupon_id: dealId,
        user_agent: req.headers.get('user-agent') || null,
      })
      await sb.rpc('increment_usage', { coupon_id: dealId }).then(() => {}, () => {})
    } catch {
      // ignore logging errors
    }
  }

  if (dest) return NextResponse.redirect(dest, 302)
  return NextResponse.redirect(new URL('/', req.url), 302)
}
