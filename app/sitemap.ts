import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://www.endoverpay.com'

export const revalidate = 3600 // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                     lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/stores`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/categories`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/blog`,           lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${SITE_URL}/about`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/submit-coupon`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms`,          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [storesRes, categoriesRes] = await Promise.all([
      sb.from('stores').select('slug, created_at'),
      sb.from('categories').select('slug'),
    ])

    const storePages: MetadataRoute.Sitemap = (storesRes.data || [])
      .filter((s) => s.slug)
      .map((s) => ({
        url: `${SITE_URL}/store/${s.slug}`,
        lastModified: s.created_at ? new Date(s.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }))

    const categoryPages: MetadataRoute.Sitemap = (categoriesRes.data || [])
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITE_URL}/category/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

    return [...staticPages, ...storePages, ...categoryPages]
  } catch {
    return staticPages
  }
}
