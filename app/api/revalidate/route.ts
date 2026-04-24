import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { storeSlug, tag } = await req.json()
  if (tag) revalidateTag(tag)
  if (storeSlug) revalidatePath(`/store/${storeSlug}`)
  revalidatePath('/')
  revalidatePath('/stores')
  return NextResponse.json({ revalidated: true, storeSlug, tag })
}
