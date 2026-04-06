import type { Metadata } from 'next'
import { TrendingUp, Clock, Star, Flame } from 'lucide-react'
import HeroSection from '@/components/home/HeroSection'
import CategoryBar from '@/components/home/CategoryBar'
import SectionHeader from '@/components/home/SectionHeader'
import CouponGrid from '@/components/coupon/CouponGrid'
import StoreGrid from '@/components/store/StoreGrid'
import {
  getCategories, getPopularStores, getTrendingCoupons,
  getRecentCoupons, getFeaturedCoupons,
} from '@/lib/queries'
import { SITE_NAME } from '@/lib/utils'

export const metadata: Metadata = {
  title: `${SITE_NAME} – Best Coupons & Deals in India`,
  description: 'Find verified coupon codes and deals from 500+ top stores. Save money on fashion, electronics, food, travel and more.',
}

export const revalidate = 3600 // ISR: revalidate every hour

export default async function HomePage() {
  const [categories, stores, trending, recent, featured] = await Promise.all([
    getCategories(),
    getPopularStores(12),
    getTrendingCoupons(8),
    getRecentCoupons(8),
    getFeaturedCoupons(8),
  ])

  return (
    <>
      {/* Schema markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: process.env.NEXT_PUBLIC_SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        })
      }} />

      <HeroSection />
      <CategoryBar categories={categories} />

      <div className="container-main py-10 space-y-14">

        {/* Featured Coupons */}
        {featured.length > 0 && (
          <section>
            <SectionHeader
              title="Featured Deals"
              subtitle="Handpicked top offers from the best stores"
              viewAllHref="/search"
              icon={<Star className="w-6 h-6 text-yellow-500" />}
            />
            <CouponGrid coupons={featured} />
          </section>
        )}

        {/* Trending Coupons */}
        {trending.length > 0 && (
          <section>
            <SectionHeader
              title="Trending Now"
              subtitle="Most popular deals people are using today"
              viewAllHref="/search?sort=trending"
              icon={<Flame className="w-6 h-6 text-orange-500" />}
            />
            <CouponGrid coupons={trending} />
          </section>
        )}

        {/* Popular Stores */}
        {stores.length > 0 && (
          <section>
            <SectionHeader
              title="Popular Stores"
              subtitle="Browse deals from your favourite brands"
              viewAllHref="/search"
            />
            <StoreGrid stores={stores} />
          </section>
        )}

        {/* Recently Added */}
        {recent.length > 0 && (
          <section>
            <SectionHeader
              title="Recently Added"
              subtitle="Fresh deals added today"
              viewAllHref="/search?sort=newest"
              icon={<Clock className="w-6 h-6 text-blue-500" />}
            />
            <CouponGrid coupons={recent} />
          </section>
        )}

        {/* Categories grid */}
        {categories.length > 0 && (
          <section>
            <SectionHeader
              title="Browse by Category"
              subtitle="Find deals for every need"
              icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((c) => (
                <a key={c.id} href={`/category/${c.slug}`}
                  className="card p-4 flex flex-col items-center gap-2 text-center hover:border-orange-200 hover:-translate-y-0.5 transition-all group">
                  <span className="text-3xl">{c.icon || '🏷️'}</span>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors">{c.name}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Trust strip */}
        <section className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { emoji: '✅', title: '100% Verified Codes', desc: 'Every coupon is manually tested before publishing' },
              { emoji: '🔄', title: 'Updated Daily', desc: 'We add new deals every single day' },
              { emoji: '🔒', title: 'Safe & Secure', desc: 'No registration required to use our coupons' },
            ].map((item) => (
              <div key={item.title}>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
