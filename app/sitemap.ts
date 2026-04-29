import { MetadataRoute } from 'next'

const SITE_URL = 'https://www.endoverpay.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL,                        lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/stores`,            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/categories`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/about`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/submit-coupon`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy-policy`,    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`,        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
