import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://endoverpay.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Plain client — no cookies needed, works in sitemap context
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [storesRes, categoriesRes, couponsRes] = await Promise.all([
    supabase.from('stores').select('slug'),
    supabase.from('categories').select('slug'),
    supabase
      .from('coupons')
      .select('slug, created_at, expiry_date')
      .not('slug', 'is', null)
      .or('expiry_date.is.null,expiry_date.gt.' + new Date().toISOString()),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                 lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${SITE_URL}/stores`,     lastModified: new Date(), changeFrequency: 'daily',  priority: 0.8 },
    { url: `${SITE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/blog`,       lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]

  const storePages: MetadataRoute.Sitemap = (storesRes.data || []).map((s) => ({
    url: `${SITE_URL}/store/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const categoryPages: MetadataRoute.Sitemap = (categoriesRes.data || []).map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const now = new Date()
  const couponPages: MetadataRoute.Sitemap = (couponsRes.data || [])
    .filter((c) => c.slug && (!c.expiry_date || new Date(c.expiry_date) > now))
    .map((c) => ({
      url: `${SITE_URL}/coupon/${c.slug}`,
      lastModified: new Date(c.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  return [...staticPages, ...storePages, ...categoryPages, ...couponPages]
}
// Sat Apr 11 02:31:33 IST 2026
