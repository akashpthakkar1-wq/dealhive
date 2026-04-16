import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Tag, ArrowRight } from 'lucide-react'
import CouponCard from '@/components/coupon/CouponCard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isExpired, SITE_NAME, SITE_URL } from '@/lib/utils'

interface Props { params: { slug: string } }

export const revalidate = 3600

function interleaveCoupons(coupons: any[]) {
  const byStore: Record<string, any[]> = {}
  for (const coupon of coupons) {
    const key = coupon.store?.slug || 'unknown'
    if (!byStore[key]) byStore[key] = []
    byStore[key].push(coupon)
  }
  const groups = Object.values(byStore)
  const result: any[] = []
  let i = 0
  while (result.length < coupons.length) {
    for (const group of groups) {
      if (group[i] !== undefined) result.push(group[i])
    }
    i++
  }
  return result
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', params.slug).single()
  if (!cat) return { title: 'Category Not Found' }
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const title = `Best ${cat.name} Coupons, Promo Codes & Deals – ${month}`
  const description = `Find the best verified ${cat.name} coupons, promo codes, voucher codes and discount codes for ${month}. Save on top ${cat.name} brands worldwide.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${cat.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/category/${cat.slug}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const supabase = createServerSupabaseClient()

  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!cat) notFound()

  const { data: couponsByCategory } = await supabase
    .from('coupons')
    .select('*, store:stores(name, slug, logo, website_url)')
    .eq('category_id', cat.id)
    .order('created_at', { ascending: false })

  const { data: storesByCategory } = await supabase
    .from('stores')
    .select('id')
    .ilike('category', cat.name)

  let couponsByStore: any[] = []
  if (storesByCategory && storesByCategory.length > 0) {
    const storeIds = storesByCategory.map((s) => s.id)
    const { data } = await supabase
      .from('coupons')
      .select('*, store:stores(name, slug, logo, website_url)')
      .in('store_id', storeIds)
      .order('created_at', { ascending: false })
    couponsByStore = data || []
  }

  const allCouponsMap = new Map()
  ;[...(couponsByCategory || []), ...couponsByStore].forEach((c) => {
    if (!allCouponsMap.has(c.id)) allCouponsMap.set(c.id, c)
  })
  const allCoupons = Array.from(allCouponsMap.values())

  const activeCoupons = interleaveCoupons(allCoupons.filter((c) => !isExpired(c.expiry_date)))
  const expiredCoupons = allCoupons.filter((c) => isExpired(c.expiry_date))

  const { data: allCats } = await supabase
    .from('categories')
    .select('id,name,slug,icon')
    .order('name')

  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',       item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Categories', item: `${SITE_URL}/categories` },
        { '@type': 'ListItem', position: 3, name: `${cat.name} Coupons`, item: `${SITE_URL}/category/${cat.slug}` },
      ],
    },
    // Only output ItemList when coupons exist — empty itemListElement causes SEMrush error
    ...(activeCoupons.length > 0 ? [{
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: `Best ${cat.name} Coupons ${month}`,
      numberOfItems: activeCoupons.length,
      itemListElement: activeCoupons.slice(0, 10).map((c: any, i: number) => ({
        '@type': 'ListItem', position: i + 1,
        item: { '@type': 'Offer', name: c.title, url: `${SITE_URL}/store/${c.store?.slug}`,
          ...(c.expiry_date && { validThrough: c.expiry_date }),
        },
      })),
    }] : []),
  ]


  // Category FAQs
  const categoryFaqs: Record<string, {q: string, a: string}[]> = {
    fashion: [
      { q: `What are the best ${cat.name} coupon codes right now?`, a: `Browse our verified ${cat.name} coupon codes above. All codes are manually tested and updated daily. Look for codes marked "Verified" for guaranteed savings.` },
      { q: `How do I use a ${cat.name} promo code?`, a: `Find a coupon code above and click "Get Code". Copy the code, visit the store, add items to your cart, and paste the code at checkout in the promo code box.` },
      { q: `Do ${cat.name} discount codes expire?`, a: `Yes, most ${cat.name} discount codes have an expiry date. Always check the expiry shown on each coupon. We remove expired codes daily to keep our listings fresh.` },
      { q: `Can I stack multiple ${cat.name} coupon codes?`, a: `Most stores allow only one coupon code per order. However, you can often combine a coupon code with a sale price for extra savings.` },
      { q: `Where can I find the best ${cat.name} deals?`, a: `EndOverPay updates ${cat.name} deals daily. Bookmark this page and check back often for the latest verified ${cat.name} coupon codes and promo codes.` },
    ],
  }
  const faqs = (cat.faq_content && Array.isArray(cat.faq_content) && cat.faq_content.length > 0)
    ? cat.faq_content.map((f: any) => ({ q: f.q, a: f.a }))
    : categoryFaqs[cat.slug] || [
    { q: `What are the best ${cat.name} coupon codes right now?`, a: `Browse our verified ${cat.name} coupon codes above. All codes are manually tested and updated daily.` },
    { q: `How do I use a ${cat.name} promo code?`, a: `Click "Get Code" on any offer above. Copy the code and paste it at checkout on the store's website.` },
    { q: `Do ${cat.name} discount codes expire?`, a: `Yes, most codes have an expiry date shown on each coupon. We remove expired codes daily.` },
    { q: `Are ${cat.name} coupon codes free to use?`, a: `Yes, all coupon codes on EndOverPay are completely free. Simply copy and apply at checkout.` },
    { q: `How often are ${cat.name} deals updated?`, a: `We update ${cat.name} deals daily. New coupon codes are added as soon as they become available.` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
{faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      }) }} />}
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-10">
        <div className="container-main">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{cat.icon || '🏷️'}</div>
            <div>
              <h1 className="text-3xl font-extrabold mb-1">
                Best {cat.name} Coupons, Promo Codes &amp; Deals – {month}
              </h1>
              <p className="text-white/80 text-sm">
                {activeCoupons.length} active offers · Updated today
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── Main content ── */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Best 
              {activeCoupons.length > 0
                ? `${activeCoupons.length} Active ${cat.name} Coupons & Deals`
                : `No active ${cat.name} coupons right now`}
            </h2>
            {activeCoupons.length > 0 && (
              <p className="text-sm text-gray-500 mt-2 mb-4">
                {cat.description || <>Browse the best <strong>{cat.name} coupon codes</strong>, promo codes and voucher codes for {month}.
                All <strong>{cat.name} discount codes</strong> are verified and updated daily.
                Save on top {cat.name} brands with exclusive deals — up to{' '}
                <strong>{Math.max(...activeCoupons.map((c: any) => parseInt(c.discount || '0')).filter(Boolean))}% off</strong>.</>}
              </p>
            )}

            {activeCoupons.length > 0 ? (
              // ✅ 2-column grid on desktop, 1-column on mobile, equal height
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                {activeCoupons.map((c) => (
                  <CouponCard key={c.id} coupon={c} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-4">{cat.icon || '🏷️'}</div>
                <p className="font-semibold text-gray-500 mb-1">No active {cat.name} offers right now</p>
                <p className="text-sm text-gray-400 mb-4">We update deals daily — check back soon!</p>
                <Link href="/search" className="btn-primary">
                  Browse All Deals <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {expiredCoupons.length > 0 && (
              <details className="bg-white rounded-xl border border-gray-100 p-4">
                <summary className="cursor-pointer font-semibold text-gray-500 text-sm list-none flex items-center gap-2">
                  Show {expiredCoupons.length} expired offers
                </summary>
                <div className="mt-3 opacity-60 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                  {expiredCoupons.slice(0, 4).map((c) => (
                    <CouponCard key={c.id} coupon={c} />
                  ))}
                </div>
              </details>
            )}

            {/* Top Stores in Category */}
            {storesByCategory && storesByCategory.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Top {cat.name} Stores
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {storesByCategory.slice(0, 6).map((s: any) => (
                    <Link key={s.id} href={`/store/${s.slug}`}
                      className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-primary-300 hover:bg-primary-50 transition-all">
                      <div className="w-8 h-8 rounded-lg border border-gray-100 bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                        {s.logo ? <img src={s.logo} alt={s.name} className="w-full h-full object-contain p-1" /> : <span className="text-xs font-bold text-primary-400">{s.name[0]}</span>}
                      </div>
                      <span className="text-xs font-semibold text-gray-700 truncate">{s.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {cat.name} Coupons — Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary-50 transition-colors list-none">
                      <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                      <span className="text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0">›</span>
                    </summary>
                    <div className="px-4 pb-4 pt-2 text-sm text-gray-600 leading-relaxed border-t border-gray-50">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
                All Categories
              </h3>
              <div className="space-y-1">
                {(allCats || []).map((c) => (
                  <Link key={c.id} href={`/category/${c.slug}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      c.id === cat.id
                        ? 'bg-primary-500 text-white'
                        : 'hover:bg-primary-50 text-gray-700 hover:text-primary-600'
                    }`}>
                    <span>{c.icon || '🏷️'}</span>
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
