import { MetadataRoute } from 'next'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

const SITE_URL = 'https://endoverpay.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminSupabaseClient()

  const [storesRes, categoriesRes, couponsRes] = await Promise.all([
    supabase.from('stores').select('slug, updated_at, created_at'),
    supabase.from('categories').select('slug, updated_at'),
    supabase
      .from('coupons')
      .select('slug, created_at, expiry_date')
      .not('slug', 'is', null)
      .or('expiry_date.is.null,expiry_date.gt.' + new Date().toISOString()),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                    lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${SITE_URL}/stores`,        lastModified: new Date(), changeFrequency: 'daily',  priority: 0.8 },
    { url: `${SITE_URL}/categories`,    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/blog`,          lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]

  const storePages: MetadataRoute.Sitemap = (storesRes.data || []).map((s) => ({
    url: `${SITE_URL}/store/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : s.created_at ? new Date(s.created_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  const categoryPages: MetadataRoute.Sitemap = (categoriesRes.data || []).map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const couponPages: MetadataRoute.Sitemap = (couponsRes.data || [])
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE_URL}/coupon/${c.slug}`,
      lastModified: new Date(c.created_at),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

  return [...staticPages, ...storePages, ...categoryPages, ...couponPages]
}
