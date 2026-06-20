import Link from 'next/link'
import { Suspense } from 'react'
import Image from 'next/image'
import { ArrowRight, Tag, TrendingUp, Star, Clock, Zap, Store } from 'lucide-react'
import LiveSavingCount from '@/components/ui/LiveSavingCount'
import HeroSearchBar from '@/components/hero/HeroSearchBar'
import CouponCard from '@/components/coupon/CouponCard'
import DealOfTheDay from '@/components/ui/DealOfTheDay'
import {
  getFeaturedCoupons,
  getTrendingCoupons,
  getRecentCoupons,
  getPopularStores,
  getCategories,
  getDealOfTheDayCoupons,
} from '@/lib/queries'

export const revalidate = 3600
export const fetchCache = 'force-cache'

// Async component for below-the-fold data — hero renders immediately
async function HomePageData() {
  const [featured, trending, recent, stores, categories, dealOfTheDayCoupons] = await Promise.all([
    getFeaturedCoupons(6),
    getTrendingCoupons(6),
    getRecentCoupons(8),
    getPopularStores(12),
    getCategories(),
    getDealOfTheDayCoupons(),
  ])

  const dayOfWeek = new Date().getDay()
  const todaySlot = dayOfWeek === 0 ? 7 : dayOfWeek
  const todaysDeal = dealOfTheDayCoupons.find((c: any) => c.deal_of_the_day_order === todaySlot)
    ?? dealOfTheDayCoupons[0]
    ?? featured[0]

  return (
    <div>
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

      {/* ── SEO INTRO TEXT ── */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="container-main">
          <p className="text-sm text-gray-500 leading-relaxed">
              Welcome to <strong>EndOverPay</strong> — your trusted source for verified <strong>coupon codes</strong>, <strong>promo codes</strong>, <strong>voucher codes</strong> and <strong>discount codes</strong> from hundreds of top online stores worldwide. 
              We manually verify every deal before publishing so you never waste time on expired codes. 
              From fashion and electronics to food delivery and travel, find the best deals updated daily across all categories. 
              Stop overpaying — start saving smarter with EndOverPay.
          </p>
        </div>
      </section>

      {/* ── FEATURED DEALS ── */}
      <section className="section-white">
        <div className="container-main">
          <SectionHeader icon={<Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
            title="Featured Coupon Codes & Deals Today" subtitle="Handpicked verified coupon codes from top stores worldwide"
            href="/search?filter=featured" />
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {featured.slice(0, 6).map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          ) : <EmptyState />}
        </div>
      </section>

      {/* ── DEAL OF THE DAY ── */}
      {todaysDeal && (
        <section className="section-white">
          <div className="container-main">
            <SectionHeader
              icon={<Zap className="w-5 h-5 text-[#EA580C]" />}
              title="Deal of the Day"
              subtitle="Hand-picked top deal — expires at midnight"
              href="/search?filter=featured"
            />
            <DealOfTheDay coupon={todaysDeal} />
          </div>
        </section>
      )}

      {/* ── POPULAR STORES ── */}
      <section className="section-white">
        <div className="container-main">
          <SectionHeader icon={<Store className="w-5 h-5 text-primary-500" />}
            title="Popular Stores with Coupon Codes" subtitle="Find coupon codes & promo codes from 500+ global stores"
            href="/stores" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
            {stores.map((store) => {
              const rawCoupons = (store as any).coupons as any[]
              const couponCount = Array.isArray(rawCoupons) ? rawCoupons.length : 0
              const maxDiscount = Array.isArray(rawCoupons)
                ? rawCoupons.reduce((max: number, cp: any) => {
                    const n = parseInt(cp.discount || '0')
                    return n > max ? n : max
                  }, 0)
                : 0
              return (
                <Link key={store.id} href={`/store/${store.slug}`} prefetch={false}
                  className="relative bg-white rounded-xl border border-gray-100 px-2 py-3.5 flex flex-col items-center text-center hover:border-primary-300 hover:shadow-md transition-all group overflow-hidden">
                  {/* Diagonal discount ribbon — main highlight */}
                  {maxDiscount > 0 && (
                    <div className="absolute top-[9px] -right-[26px] bg-gradient-to-r from-[#EA580C] to-[#F59E0B] text-white text-[10px] font-extrabold px-7 py-0.5 rotate-45 whitespace-nowrap shadow-sm">
                      {maxDiscount}%
                    </div>
                  )}
                  {/* Logo */}
                  <div className="rounded-xl overflow-hidden flex items-center justify-center mb-2" style={{ width: '46px', height: '46px' }}>
                    {store.logo
                      ? <Image src={store.logo} alt={`${store.name} logo`} width={46} height={46} className="object-contain w-full h-full" />
                      : <Tag className="w-6 h-6 text-primary-400" />}
                  </div>
                  {/* Store name */}
                  <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate w-full leading-tight">
                    {store.name}
                  </div>
                  {/* Offer count */}
                  {couponCount > 0 && (
                    <div className="text-xs text-primary-600 font-semibold leading-tight mt-1">
                      {couponCount} offers
                    </div>
                  )}
                </Link>
              )
            })}
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
            title="Trending Promo Codes This Week" subtitle="Most used coupon codes and promo codes today"
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
            title="Browse Coupons by Category" subtitle="Coupon codes by category — fashion, electronics, food & more"
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
            title="Recently Added Coupon Codes" subtitle="Latest verified coupon codes added today"
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
        <h3 className="text-sm text-gray-600 font-normal">{subtitle}</h3>
      </div>
      <Link href={href} className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 whitespace-nowrap">
        View All <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-12 text-center text-gray-500">
      <Tag className="w-10 h-10 mx-auto mb-2 text-gray-200" />
      <p className="font-semibold text-sm">No deals available right now. Check back soon!</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <div>
      {/* ── HERO renders immediately - no data needed ── */}
      <section className="relative text-white overflow-hidden" style={{
        background: "radial-gradient(120% 90% at 85% 0%, #b84a12 0%, transparent 58%), linear-gradient(165deg, #c2410c, #9a3412 60%, #7c2d12)",
        padding: "64px 0 70px"
      }}>
        <div className="container-main">
          <div className="grid gap-11 items-center" style={{ gridTemplateColumns: "1fr 0.9fr", maxWidth: "1180px", margin: "0 auto" }}>

            {/* LEFT COLUMN */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ letterSpacing: "2.5px", color: "#FED7AA" }}>
                3,200+ verified deals · updated daily
              </p>
              <h1 className="font-extrabold mb-5 leading-tight" style={{ fontSize: "clamp(36px, 4vw, 48px)", letterSpacing: "-1.2px", color: "#fff5eb" }}>
                Stop overpaying.<br />
                <span className="italic" style={{ color: "#FED7AA" }}>Start saving smarter.</span>
              </h1>
              <p className="mb-7 leading-relaxed" style={{ fontSize: "16px", color: "#f8d5b8", maxWidth: "440px" }}>
                Hand-verified coupon codes and deals from 500+ stores. No expired codes, no hassle — just real savings up to 90% off.
              </p>
              <div className="mb-6" style={{ maxWidth: "480px" }}>
                <HeroSearchBar />
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-sm font-bold" style={{ color: "#86efac" }}>✓ 3,200+ active deals</span>
                <span className="text-sm font-bold" style={{ color: "#86efac" }}>✓ 100% verified</span>
                <span className="text-sm font-bold" style={{ color: "#86efac" }}>✓ Updated daily</span>
              </div>
            </div>

            {/* RIGHT COLUMN — floating coupon card */}
            <div className="hidden md:flex justify-center">
              <div className="bg-white rounded-2xl p-7 w-full" style={{
                maxWidth: "460px",
                transform: "rotate(-1.4deg)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)"
              }}>
                {/* Card top row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl font-extrabold" style={{ background: "#fde8d8", color: "#EA580C" }}>
                    M
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-gray-900 leading-tight">Myntra</p>
                    <p className="text-sm font-semibold" style={{ color: "#2f7d5b" }}>✓ Verified today</p>
                  </div>
                  <div className="text-sm font-bold px-3 py-2 rounded-lg flex-shrink-0" style={{ background: "#fdf0d8", color: "#C0852E" }}>
                    25% OFF
                  </div>
                </div>
                {/* Card body */}
                <p className="font-semibold text-base text-gray-900 mb-2 leading-snug">Flat 25% off on fashion &amp; accessories</p>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">Valid on all clothing, shoes &amp; bags. Min. order ₹999. No exclusions on sale items.</p>
                {/* Reveal row */}
                <div className="flex rounded-xl overflow-hidden" style={{ border: "1.5px dashed #d4c9a8" }}>
                  <div className="flex-1 flex items-center px-4 py-3.5 font-mono font-semibold" style={{
                    background: "repeating-linear-gradient(45deg,#faf6ec,#faf6ec 6px,#f4eddc 6px,#f4eddc 12px)",
                    color: "#C0852E",
                    letterSpacing: "1px",
                    fontSize: "15px"
                  }}>
                    MYNTRAFAB25
                  </div>
                  <button className="px-5 py-3.5 text-sm font-bold text-white flex-shrink-0 transition-colors hover:bg-[#C2410C]" style={{ background: "#EA580C" }}>
                    Copy code
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── DATA sections stream in via Suspense ── */}
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 animate-pulse" />
      }>
        <HomePageData />
      </Suspense>
    </div>
  )
}
