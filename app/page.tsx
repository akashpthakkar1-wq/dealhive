import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Tag, TrendingUp, Star, Clock, Zap, Store } from 'lucide-react'
import dynamic from 'next/dynamic'
const CouponCard = dynamic(() => import('@/components/coupon/CouponCard'), { ssr: false })
import HeroSearchBar from '@/components/hero/HeroSearchBar'
import {
  getFeaturedCoupons,
  getTrendingCoupons,
  getRecentCoupons,
  getPopularStores,
  getCategories,
} from '@/lib/queries'

export const revalidate = 3600

export default async function HomePage() {
  const [featured, trending, recent, stores, categories] = await Promise.all([
    getFeaturedCoupons(6),
    getTrendingCoupons(6),
    getRecentCoupons(8),
    getPopularStores(12),
    getCategories(),
  ])

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-[#EA580C] via-[#C2410C] to-[#9A3412] text-white py-14">
        <div className="container-main text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-5 border border-white/20">
            <Zap className="w-3.5 h-3.5 text-[#FED7AA]" />
            1,240 people saving right now
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Best Coupon Codes, Promo Codes &amp; Voucher Codes –<br />
            <span className="text-[#FED7AA]">Save Up to 90% Off</span>
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Your trusted coupon platform worldwide. Verified codes, real savings, zero hassle.
          </p>

          {/* ✅ Client component — live search with dropdown */}
          <HeroSearchBar />

          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/70">
            <span>✅ 3,200+ Active Deals</span>
            <span>✅ 100% Verified</span>
            <span>✅ Updated Daily</span>
          </div>
        </div>
      </section>

      {/* ── CATEGORY BAR ── */}
      <section className="bg-white border-b border-gray-100 py-4 sticky top-16 z-30 shadow-sm">
        <div className="container-main">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <Link href="/search" className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 text-white text-sm font-bold">
              All Deals
            </Link>
            {categories.slice(0, 10).map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-primary-100 hover:text-primary-700 text-gray-700 text-sm font-semibold transition-all whitespace-nowrap">
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DEALS ── */}
      <section className="section-white">
        <div className="container-main">
          <SectionHeader icon={<Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
            title="Featured Deals" subtitle="Handpicked top offers from the best stores"
            href="/search?filter=featured" />
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {featured.slice(0, 6).map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          ) : <EmptyState />}
        </div>
      </section>

      {/* ── POPULAR STORES ── */}
      <section className="section-purple">
        <div className="container-main">
          <SectionHeader icon={<Store className="w-5 h-5 text-primary-500" />}
            title="Popular Stores" subtitle="Browse top stores and their latest deals"
            href="/stores" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {stores.map((store) => (
              <Link key={store.id} href={`/store/${store.slug}`}
                className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:border-primary-300 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                  {store.logo
                    ? <Image src={store.logo} alt={`${store.name} logo`} width={48} height={48} className="object-contain p-1" />
                    : <Tag className="w-6 h-6 text-primary-400" />}
                </div>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                  {store.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/stores" className="btn-secondary">View All Stores <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* ── TRENDING NOW ── */}
      <section className="section-white">
        <div className="container-main">
          <SectionHeader icon={<TrendingUp className="w-5 h-5 text-red-500" />}
            title="Trending Now" subtitle="Hot deals flying off the shelf"
            href="/search?filter=trending" />
          {trending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {trending.slice(0, 6).map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          ) : <EmptyState />}
        </div>
      </section>

      {/* ── BROWSE BY CATEGORY ── */}
      <section className="section-gray">
        <div className="container-main">
          <SectionHeader icon={<Tag className="w-5 h-5 text-primary-500" />}
            title="Browse by Category" subtitle="Find deals in your favourite categories"
            href="/categories" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center gap-2 hover:border-primary-300 hover:shadow-md hover:bg-primary-50 transition-all group text-center">
                <div className="text-4xl">{cat.icon || '🏷️'}</div>
                <div className="font-bold text-gray-800 text-sm group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/categories" className="btn-secondary">All Categories <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* ── RECENTLY ADDED ── */}
      <section className="section-white">
        <div className="container-main">
          <SectionHeader icon={<Clock className="w-5 h-5 text-blue-500" />}
            title="Recently Added" subtitle="Fresh deals added today"
            href="/search?sort=recent" />
          {recent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {recent.slice(0, 6).map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          ) : <EmptyState />}
          <div className="text-center mt-6">
            <Link href="/search" className="btn-primary">View All Deals <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle, href }: {
  icon: React.ReactNode; title: string; subtitle: string; href: string
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2 mb-0.5">
          {icon} {title}
        </h2>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <Link href={href} className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 whitespace-nowrap">
        View All <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-12 text-center text-gray-400">
      <Tag className="w-10 h-10 mx-auto mb-2 text-gray-200" />
      <p className="font-semibold text-sm">No deals available right now. Check back soon!</p>
    </div>
  )
}
