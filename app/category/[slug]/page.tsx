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

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
                Browse the best <strong>{cat.name} coupon codes</strong>, promo codes and voucher codes for {month}.
                All <strong>{cat.name} discount codes</strong> are verified and updated daily.
                Save on top {cat.name} brands with exclusive deals — up to{' '}
                <strong>{Math.max(...activeCoupons.map((c: any) => parseInt(c.discount || '0')).filter(Boolean))}% off</strong>.
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
                {/* ✅ 2-column grid for expired too */}
                <div className="mt-3 opacity-60 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                  {expiredCoupons.slice(0, 4).map((c) => (
                    <CouponCard key={c.id} coupon={c} />
                  ))}
                </div>
              </details>
            )}
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
