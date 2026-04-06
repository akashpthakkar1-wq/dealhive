import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SITE_URL } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient()

  const [coupons, stores, categories] = await Promise.all([
    supabase.from('coupons').select('slug,created_at').order('created_at', { ascending: false }),
    supabase.from('stores').select('slug,created_at'),
    supabase.from('categories').select('slug'),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  const storePages: MetadataRoute.Sitemap = (stores.data || []).map((s) => ({
    url: `${SITE_URL}/store/${s.slug}`,
    lastModified: new Date(s.created_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const couponPages: MetadataRoute.Sitemap = (coupons.data || []).map((c) => ({
    url: `${SITE_URL}/coupon/${c.slug}`,
    lastModified: new Date(c.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const categoryPages: MetadataRoute.Sitemap = (categories.data || []).map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: 'daily',
    priority: 0.75,
  }))

  return [...staticPages, ...storePages, ...couponPages, ...categoryPages]
}
