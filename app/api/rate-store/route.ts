import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Records a 1-5 star rating for a store. Called by the StoreRating widget.
// Validates input, calls the add_store_rating RPC (atomic increment of
// rating_sum + rating_count), and returns the updated totals so the widget
// can show the new average immediately.
export async function POST(req: NextRequest) {
  let body: { storeId?: string; stars?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const storeId = body.storeId
  const stars = Number(body.stars)

  // Validate
  if (!storeId || typeof storeId !== 'string') {
    return NextResponse.json({ error: 'Missing storeId' }, { status: 400 })
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'stars must be 1-5' }, { status: 400 })
  }

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Atomic increment via RPC
    const { error: rpcError } = await sb.rpc('add_store_rating', {
      store_id_input: storeId,
      stars,
    })
    if (rpcError) {
      return NextResponse.json({ error: 'Could not record rating' }, { status: 500 })
    }

    // Fetch updated totals to return to the widget
    const { data, error: readError } = await sb
      .from('stores')
      .select('rating_sum, rating_count')
      .eq('id', storeId)
      .single()

    if (readError || !data) {
      // Rating was recorded; just can't read back. Return success without totals.
      return NextResponse.json({ ok: true })
    }

    const count = data.rating_count || 0
    const avg = count > 0 ? data.rating_sum / count : 0
    return NextResponse.json({
      ok: true,
      ratingCount: count,
      ratingSum: data.rating_sum,
      average: Math.round(avg * 10) / 10, // one decimal
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
