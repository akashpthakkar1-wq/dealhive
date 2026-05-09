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
          '/manifest.json',
          '/sw.js',
          '/workbox-*.js',
        ],
      },
    ],
    sitemap: 'https://www.endoverpay.com/sitemap.xml',
  }
}
