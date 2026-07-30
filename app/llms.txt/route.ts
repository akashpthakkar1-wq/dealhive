import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://www.endoverpay.com'

export const revalidate = 3600 // regenerate hourly

export async function GET() {
  let storeLines = ''
  let categoryLines = ''

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [storesRes, categoriesRes] = await Promise.all([
      sb.from('stores').select('name, slug').order('name'),
      sb.from('categories').select('name, slug').order('name'),
    ])

    storeLines = (storesRes.data || [])
      .filter((s) => s.slug && s.name)
      .map((s) => `- [${s.name} Coupons & Promo Codes](${SITE_URL}/store/${s.slug})`)
      .join('\n')

    categoryLines = (categoriesRes.data || [])
      .filter((c) => c.slug && c.name)
      .map((c) => `- [${c.name} Coupons & Deals](${SITE_URL}/category/${c.slug})`)
      .join('\n')
  } catch {
    // fall through with empty lists
  }

  const body = `# EndOverPay

> EndOverPay (endoverpay.com) is an India-focused coupon and deals website. We list verified coupon codes, promo codes, and deals for popular Indian and global online stores, helping shoppers in India save money across fashion, food delivery, electronics, travel, beauty, and more.

Every coupon is checked before it is published. Store pages include current offers, how to redeem codes, saving tips, and frequently asked questions. Prices and offers are in INR and relevant to shoppers in India.

## Key Pages

- [Home](${SITE_URL})
- [All Stores](${SITE_URL}/stores)
- [Browse by Category](${SITE_URL}/categories)
- [Blog](${SITE_URL}/blog)
- [Submit a Coupon](${SITE_URL}/submit-coupon)

## Stores
${storeLines || '- [All Stores](' + SITE_URL + '/stores)'}

## Categories
${categoryLines || '- [All Categories](' + SITE_URL + '/categories)'}

## About

- [About EndOverPay](${SITE_URL}/about)
- [Contact](${SITE_URL}/contact)
- [Privacy Policy](${SITE_URL}/privacy-policy)
- [Terms of Service](${SITE_URL}/terms)
- [Affiliate Disclaimer](${SITE_URL}/disclaimer)
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
