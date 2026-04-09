import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/store/*?filter=*',
          '/store/*?sort=*',
          '/search?*',
        ],
      },
    ],
    sitemap: 'https://endoverpay.com/sitemap.xml',
  }
}
