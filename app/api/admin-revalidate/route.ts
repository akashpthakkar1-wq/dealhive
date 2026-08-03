import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Admin-only revalidation. Auth = the same `admin_auth` cookie the middleware checks
// for /admin routes. This lets admin actions (expire/verify a coupon) instantly refresh
// the affected store page WITHOUT exposing REVALIDATE_SECRET to the browser.
export async function POST(req: NextRequest) {
  const auth = req.cookies.get('admin_auth')
  if (auth?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let storeSlug: string | undefined
  try {
    const body = await req.json()
    storeSlug = typeof body.storeSlug === 'string' ? body.storeSlug : undefined
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  if (storeSlug) revalidatePath(`/store/${storeSlug}`)
  revalidatePath('/')
  revalidatePath('/stores')

  return NextResponse.json({ revalidated: true, storeSlug: storeSlug || null })
}
