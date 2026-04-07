import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, ArrowRight } from 'lucide-react'
import CouponCard from '@/components/coupon/CouponCard'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isExpired, SITE_NAME, SITE_URL } from '@/lib/utils'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: cat } = await supabase.from('categories').select('*').eq('slug', params.slug).single()
  if (!cat) return { title: 'Category Not Found' }
  return {
    title: `${cat.name} Coupons & Deals | ${SITE_NAME}`,
    description: `Find the best ${cat.name} coupon codes and deals. Verified offers updated daily.`,
    alternates: { canonical: `${SITE_URL}/category/${cat.slug}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const supabase = createServerSupabaseClient()

  // Get category
  const { data: cat } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!cat) notFound()

  // Get coupons by category_id (direct relationship)
  const { data: couponsByCategory } = await supabase
    .from('coupons')
    .select('*, store:stores(name, slug, logo)')
    .eq('category_id', cat.id)
    .order('created_at', { ascending: false })

  // ALSO get coupons from stores whose category matches this category name
  // This fixes the "0 active offers" issue when stores are tagged with category name
  const { data: storesByCategory } = await supabase
    .from('stores')
    .select('id')
    .ilike('category', cat.name)

  let couponsByStore: any[] = []
  if (storesByCategory && storesByCategory.length > 0) {
    const storeIds = storesByCategory.map((s) => s.id)
    const { data } = await supabase
      .from('coupons')
      .select('*, store:stores(name, slug, logo)')
      .in('store_id', storeIds)
      .order('created_at', { ascending: false })
    couponsByStore = data || []
  }

  // Merge and deduplicate
  const allCouponsMap = new Map()
  ;[...(couponsByCategory || []), ...couponsByStore].forEach((c) => {
    if (!allCouponsMap.has(c.id)) allCouponsMap.set(c.id, c)
  })
  const allCoupons = Array.from(allCouponsMap.values())

  const activeCoupons = allCoupons.filter((c) => !isExpired(c.expiry_date))
  const expiredCoupons = allCoupons.filter((c) => isExpired(c.expiry_date))

  // Get all categories for sidebar
  const { data: allCats } = await supabase.from('categories').select('id,name,slug,icon').order('name')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-10">
        <div className="container-main">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{cat.icon || '🏷️'}</div>
            <div>
              <h1 className="text-3xl font-extrabold mb-1">{cat.name} Coupons &amp; Deals</h1>
              <p className="text-white/80 text-sm">
                {activeCoupons.length} active offers · Updated today
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Main content */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">
              {activeCoupons.length > 0
                ? `${activeCoupons.length} Active ${cat.name} Coupons & Deals`
                : `No active ${cat.name} coupons right now`}
            </h2>

            {activeCoupons.length > 0 ? (
              <div className="space-y-3">
                {activeCoupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-4">{cat.icon || '🏷️'}</div>
                <p className="font-semibold text-gray-500 mb-1">No active {cat.name} offers right now</p>
                <p className="text-sm text-gray-400 mb-4">We update deals daily — check back soon!</p>
                <Link href="/search" className="btn-primary">Browse All Deals <ArrowRight className="w-4 h-4" /></Link>
              </div>
            )}

            {expiredCoupons.length > 0 && (
              <details className="bg-white rounded-xl border border-gray-100 p-4">
                <summary className="cursor-pointer font-semibold text-gray-500 text-sm list-none flex items-center gap-2">
                  Show {expiredCoupons.length} expired offers
                </summary>
                <div className="mt-3 opacity-60 space-y-3">
                  {expiredCoupons.slice(0, 3).map(c => <CouponCard key={c.id} coupon={c} />)}
                </div>
              </details>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">All Categories</h3>
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
