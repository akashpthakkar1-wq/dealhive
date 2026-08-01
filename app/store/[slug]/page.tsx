import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Star, Clock, Tag, CheckCircle, TrendingUp, Users, ChevronRight, Info, AlertCircle } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CouponCard from '@/components/coupon/CouponCard'
import { getStoreBySlug, getCouponsByStore, getRelatedStores, getCouponsByCategory } from '@/lib/queries'
import { formatDate, isExpired, SITE_NAME, SITE_URL } from '@/lib/utils'
import StoreFilterTabs from '@/components/ui/StoreFilterTabs'
import StoreRating from '@/components/store/StoreRating'
import ExpandableText from '@/components/ui/ExpandableText'

interface Props {
  params: { slug: string }
}

// Stable random between min-max using a string seed
function stableNum(seed: string, min: number, max: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h) + seed.charCodeAt(i); h |= 0 }
  return min + (Math.abs(h) % (max - min + 1))
}

export const revalidate = 3600 // revalidate every 1 hour — served from CDN edge
export const dynamicParams = true

export const fetchCache = 'force-cache'

export async function generateStaticParams() {
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const { data } = await supabase.from('stores').select('slug')
  return (data || []).map(s => ({ slug: s.slug }))
}

// Replaces {month}, {year}, {month_short} placeholders with the live date.
// Used so manually-written titles/H1s can auto-update their month every month.
function applyDateTokens(text: string): string {
  const now = new Date()
  const monthLong = now.toLocaleString('en-IN', { month: 'long' })
  const monthShort = now.toLocaleString('en-IN', { month: 'short' })
  const year = now.getFullYear().toString()
  return text
    .replace(/\{month\}/g, monthLong)
    .replace(/\{month_short\}/g, monthShort)
    .replace(/\{year\}/g, year)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return { title: 'Store Not Found' }
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const logoUrl = store.logo || `${SITE_URL}/og-default.jpg`
  // Cap at 155 chars for Google snippet
  const rawDesc = `Find verified ${store.name} coupon codes & promo codes for ${month}. Save big with exclusive ${store.name} deals updated daily.`
  const couponsForMeta = await getCouponsByStore(params.slug)
  const couponCount = couponsForMeta?.length || 0
  const countText = couponCount > 0 ? `${couponCount} verified` : 'Verified'
  // Real max discount from this store's coupons (mirrors body logic at maxDiscount).
  // parseInt('60% OFF')=60, parseInt('FREE SHIPPING')=0, parseInt('$15 OFF')=0 -> 0 means no % discount.
  const metaMaxDiscount = (couponsForMeta || []).filter((c: any) => !isExpired(c.expiry_date)).reduce((max, c: any) => { const n = parseInt(c.discount || '0'); return n > max ? n : max }, 0)
  const discountPhrase = metaMaxDiscount > 0 ? `Up to ${metaMaxDiscount}% Off` : 'Verified Coupons & Deals'
  const discountPhraseLower = metaMaxDiscount > 0 ? `up to ${metaMaxDiscount}% off` : 'verified deals'
  const rawMeta = `${countText} ${store.name} coupon codes for ${month}. Save with ${discountPhraseLower} on ${store.name} deals. Codes verified before publishing. Get your ${store.name} promo code now.`
  const autoDesc = rawMeta.length > 155 ? rawMeta.slice(0, 152) + '…' : rawMeta
  const description = store.meta_description ? applyDateTokens(store.meta_description) : autoDesc
  const finalTitle = store.meta_title ? applyDateTokens(store.meta_title) : (metaMaxDiscount > 0 ? `${store.name} Coupons & Promo Codes ${month} – ${discountPhrase}` : `${store.name} Coupons & Promo Codes ${month}`)
  return {
    title: finalTitle,
    description,
    alternates: { canonical: `${SITE_URL}/store/${store.slug}` },
    openGraph: {
      title: store.meta_title ? finalTitle : (metaMaxDiscount > 0 ? `${store.name} Coupons & Promo Codes ${month} – ${discountPhrase}` : `${store.name} Coupons & Promo Codes ${month}`),
      description,
      url: `${SITE_URL}/store/${store.slug}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_IN',
      images: [{ url: logoUrl, width: 1200, height: 630, alt: `${store.name} coupons and promo codes` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: store.meta_title ? finalTitle : (metaMaxDiscount > 0 ? `${store.name} Coupons & Promo Codes ${month} – ${discountPhrase}` : `${store.name} Coupons & Promo Codes ${month}`),
      description,
      images: [logoUrl],
    },
  }
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

const FILTER_TABS = [
  { id: 'all',      label: 'All Offers' },
  { id: 'code',     label: '🏷️ Codes' },
  { id: 'deal',     label: '🔥 Deals' },
  { id: 'free',     label: '🚚 Free Ship' },
  { id: 'verified', label: '✅ Verified' },
  { id: 'featured', label: '⭐ Featured' },
]

export default async function StorePage({ params }: Props) {
  const store = await getStoreBySlug(params.slug)
  if (!store) notFound()
  const [allCoupons, relatedStores, categoryCoupons] = await Promise.all([
    getCouponsByStore(params.slug),
    getRelatedStores(store.category || '', store.id, 5),
    getCouponsByCategory(store.category || '', store.id, 6),
  ])

  if (!store) notFound()

  const activeCoupons   = allCoupons.filter((c) => !isExpired(c.expiry_date))
  const expiredCoupons  = allCoupons.filter((c) =>  isExpired(c.expiry_date))
  const codeCoupons     = activeCoupons.filter((c) => c.type === 'code')
  const dealCoupons     = activeCoupons.filter((c) => c.type === 'deal')
  const freeCoupons     = activeCoupons.filter((c) => (c.title + (c.description || '')).toLowerCase().includes('free ship'))


  const maxDiscount = activeCoupons.reduce((max, c) => { const n = parseInt(c.discount || '0'); return n > max ? n : max }, 0)
  // Real ratings from DB (rating_sum / rating_count). Avg only meaningful at >= 3 votes (widget enforces display threshold).
  const ratingCount = store.rating_count || 0
  const ratingAvg = ratingCount > 0 ? Math.round((store.rating_sum || 0) / ratingCount * 10) / 10 : 0
  const showRatingSchema = ratingCount >= 3


  const sidebarStores = relatedStores.slice(0, 5)
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const faqs = store.faq_content && Array.isArray(store.faq_content) && store.faq_content.length > 0
    ? store.faq_content.map((f: any) => ({ q: f.q, a: f.a }))
    : [
    { q: `How do I use a ${store.name} coupon code?`, a: `Click "Get Code" to reveal the code. You will be redirected to ${store.name}'s website. Add items to your cart, proceed to checkout, paste the coupon code in the promo code box, and click Apply.` },
    { q: `How many ${store.name} coupons are available today?`, a: `There are currently ${activeCoupons.length} active ${store.name} coupon codes and deals on ${SITE_NAME}. We update our offers daily.` },
    { q: `What is the best ${store.name} coupon code right now?`, a: `The best ${store.name} coupon right now offers${maxDiscount > 0 ? ` up to ${maxDiscount}% off` : ' great discounts'}. Check our verified offers above.` },
    { q: `Does ${store.name} offer free shipping?`, a: `${freeCoupons.length > 0 ? `Yes! We have ${freeCoupons.length} free shipping offer(s) for ${store.name}. Click the Free Shipping filter to see them.` : `Check ${store.name}'s website for current shipping policies.`}` },
    { q: `Are these ${store.name} coupon codes verified?`, a: `Yes, all coupon codes on ${SITE_NAME} are manually verified before publishing. Codes with the green Verified badge have been confirmed working.` },
    { q: `Can I use multiple ${store.name} coupons on one order?`, a: `Generally, ${store.name} allows only one coupon code per order. Combine it with ongoing sale prices for maximum savings.` },
  ]

  const savingTips = [
    `Stack coupon codes with ${store.name} sale prices for extra savings`,
    `New user codes offer the highest discounts — great for first-time shoppers`,
    `Check ${store.name}'s app for app-exclusive discounts`,
    `Subscribe to ${store.name}'s newsletter for inbox-exclusive promo codes`,
    `Bookmark ${SITE_NAME} — we update ${store.name} deals daily`,
    `Shop during seasonal sales for the biggest discounts`,
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* JSON-LD — Store + BreadcrumbList + FAQPage + ItemList */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        // 1. Store entity
        { '@context': 'https://schema.org', '@type': 'Organization', name: store.name, url: store.website_url, logo: store.logo, description: store.hero_summary || `Find ${store.name} coupon codes on ${SITE_NAME}.` },
        // 2. BreadcrumbList — enables breadcrumb display in Google search results
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',   item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Stores', item: `${SITE_URL}/stores` },
          ...(store.category ? [{ '@type': 'ListItem', position: 3, name: store.category, item: `${SITE_URL}/categories` }] : []),
          { '@type': 'ListItem', position: store.category ? 4 : 3, name: `${store.name} Coupons`, item: `${SITE_URL}/store/${store.slug}` },
        ]},
        // 3. FAQPage — enables FAQ rich results
        { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
        // 4. ItemList of coupons
        ...(activeCoupons.length > 0 ? [{ '@context': 'https://schema.org', '@type': 'ItemList', name: `${store.name} Coupon Codes ${month}`, numberOfItems: activeCoupons.length,
          itemListElement: activeCoupons.slice(0, 10).map((c, i) => ({
            '@type': 'ListItem', position: i + 1,
            item: { '@type': 'Offer', name: c.title, description: c.description || c.title,
              url: `${SITE_URL}/store/${store.slug}`,
              ...(c.expiry_date && { validThrough: c.expiry_date }),
            },
          }))
        },
        ] : []),
        // AggregateRating — emitted ONLY when backed by >= 3 real votes
        ...(showRatingSchema ? [{
          '@context': 'https://schema.org', '@type': 'Organization', name: store.name,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: ratingAvg.toFixed(1),
            bestRating: '5', worstRating: '1',
            ratingCount: ratingCount,
          },
        }] : []),
      ])}} />

      {/* ── HERO ────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-main py-4 md:py-6">
          <Breadcrumb items={[{ label: 'Stores', href: '/stores' }, ...(store.category ? [{ label: store.category, href: '/categories' }] : []), { label: `${store.name} Coupons` }]} />

          {/* Hero: stacks on mobile, logo-left/content-right on desktop */}
          <div className="mt-3 mb-3 md:mb-4">

            {/* MOBILE: logo + H1 row */}
            <div className="flex md:hidden flex-row items-center gap-3 mb-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                {store.logo
                  ? <img src={store.logo} alt={`${store.name} logo`} className="w-full h-full object-contain" />
                  : <Tag className="w-8 h-8 text-primary-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg leading-tight font-extrabold text-gray-900 mb-1.5">
                  {store.h1 ? applyDateTokens(store.h1) : <>{store.name} Coupons, Promo Codes &amp; Voucher Codes</>}
                </div>
                <div className="flex items-start gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0 mt-0.5"><circle cx="6.5" cy="6.5" r="6.5" fill="#16A34A"/><path d="M3.8 6.5L5.8 8.5L9.2 4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-xs text-gray-500">Curated & verified by the <strong className="text-gray-700 font-semibold">EndOverPay team</strong></span>
                </div>
              </div>
            </div>

            {/* DESKTOP: logo+button column (left) + content column (right) */}
            <div className="hidden md:flex flex-row items-start gap-5">
              {/* Logo + Visit button */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center">
                  {store.logo
                    ? <img src={store.logo} alt={`${store.name} logo`} className="w-full h-full object-contain" />
                    : <Tag className="w-10 h-10 text-primary-400" />}
                </div>
                {store.website_url && (
                  <a href={store.website_url} target="_blank" rel="sponsored nofollow noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    Visit {store.name}
                  </a>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl leading-tight font-extrabold text-gray-900 mb-2">
                  {store.h1 ? applyDateTokens(store.h1) : <>{store.name} Coupons, Promo Codes &amp; Voucher Codes – {month}</>}
                </h1>
                <div className="flex items-start gap-1.5 mb-2">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0 mt-0.5"><circle cx="6.5" cy="6.5" r="6.5" fill="#16A34A"/><path d="M3.8 6.5L5.8 8.5L9.2 4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-xs text-gray-500">Curated & verified by the <strong className="text-gray-700 font-semibold">EndOverPay team</strong></span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong className="text-gray-900">{activeCoupons.length}</strong> verified {store.name} {activeCoupons.length === 1 ? 'coupon' : 'coupons'} — updated for {month}
                </p>
                <ExpandableText
                  className="mb-3"
                  text={store.hero_summary || `Find the best ${store.name} coupon codes, promo codes and voucher codes verified by our team.`}
                />
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  <div className="flex flex-col items-center justify-center text-center px-2 py-2.5 rounded-xl border border-gray-200 bg-white">
                    <span className="text-lg font-extrabold text-gray-900 leading-none">{allCoupons.length}</span>
                    <span className="text-[11px] text-gray-500 font-medium mt-1">Total Offers</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-2 py-2.5 rounded-xl border border-gray-200 bg-white">
                    <span className="text-lg font-extrabold text-gray-900 leading-none">{activeCoupons.length}</span>
                    <span className="text-[11px] text-gray-500 font-medium mt-1">Active Now</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-2 py-2.5 rounded-xl border border-primary-200 bg-primary-50">
                    <span className="text-lg font-extrabold text-primary-600 leading-none">{maxDiscount > 0 ? `${maxDiscount}%` : '—'}</span>
                    <span className="text-[11px] text-primary-700 font-semibold mt-1">Best Discount</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MOBILE: full-width content below logo+H1 */}
            <div className="md:hidden space-y-3">
              <p className="text-xs text-gray-600">
                <strong className="text-gray-900">{activeCoupons.length}</strong> verified {store.name} {activeCoupons.length === 1 ? 'coupon' : 'coupons'} — updated for {month}
              </p>
              <ExpandableText
                text={store.hero_summary || `Find the best ${store.name} coupon codes, promo codes and voucher codes verified by our team.`}
              />
              <div className="grid grid-cols-3 gap-2 max-w-md">
                <div className="flex flex-col items-center justify-center text-center px-2 py-2.5 rounded-xl border border-gray-200 bg-white">
                  <span className="text-lg font-extrabold text-gray-900 leading-none">{allCoupons.length}</span>
                  <span className="text-[11px] text-gray-500 font-medium mt-1">Total Offers</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center px-2 py-2.5 rounded-xl border border-gray-200 bg-white">
                  <span className="text-lg font-extrabold text-gray-900 leading-none">{activeCoupons.length}</span>
                  <span className="text-[11px] text-gray-500 font-medium mt-1">Active Now</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center px-2 py-2.5 rounded-xl border border-primary-200 bg-primary-50">
                  <span className="text-lg font-extrabold text-primary-600 leading-none">{maxDiscount > 0 ? `${maxDiscount}%` : '—'}</span>
                  <span className="text-[11px] text-primary-700 font-semibold mt-1">Best Discount</span>
                </div>
              </div>
              {store.website_url && (
                <a href={store.website_url} target="_blank" rel="sponsored nofollow noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-sm px-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 font-semibold hover:bg-gray-50 transition-colors w-full">
                  <ExternalLink className="w-4 h-4" />
                  Visit {store.name}
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────── */}
      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── MAIN CONTENT (wide) — right on desktop, first on mobile ─────────── */}
          <div className="lg:col-span-3 space-y-6 lg:order-2">

            {/* Filter tabs + coupon list — client-side for instant filtering */}
            <StoreFilterTabs coupons={allCoupons} storeName={store.name} />


            {/* ── Quick summary table ── */}
            {activeCoupons.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-primary-50 px-5 py-3 border-b border-primary-100">
                  <h2 className="font-bold text-gray-900">Today's Best {store.name} Deals & Coupon Codes – {month}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {[
                          { label: 'Offer', cls: 'w-[45%]' },
                          { label: 'Discount', cls: 'w-[15%]' },
                          { label: 'Expires', cls: 'w-[20%]' },
                          { label: 'Code', cls: 'w-[20%]' },
                        ].map(({ label, cls }) => (
                          <th key={label} className={`text-left px-2 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider ${cls}`}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activeCoupons.slice(0, 8).map(c => (
                        <tr key={c.id} className="hover:bg-primary-50/30 transition-colors">
                          <td className="px-2 py-3 font-medium text-gray-800 text-sm">{c.title.length > 40 ? c.title.slice(0, 40) + '…' : c.title}</td>
                          <td className="px-2 py-3">{c.discount && <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{c.discount}</span>}</td>
                          <td className="px-2 py-3 text-gray-500 text-xs whitespace-nowrap">{c.expiry_date ? formatDate(c.expiry_date) : 'No expiry'}</td>
                          <td className="px-2 py-3 font-mono text-xs font-bold text-primary-600 whitespace-nowrap">{c.code ? c.code.slice(0, 4) + '•••' : '— Auto'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* About store */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">About {store.name} Coupon Codes & Deals</h2>
              <h3 className="text-sm font-semibold text-primary-600 mb-3">Why shop at {store.name} with EndOverPay?</h3>
              <div className="text-base text-gray-600 leading-relaxed space-y-3">
                {store.about_content
                  ? store.about_content.split(/\n\n+/).map((para: string, i: number) => (
                      <p key={i} className={i > 0 ? 'mt-3' : ''}>{para.trim()}</p>
                    ))
                  : <p>{store.hero_summary || `${store.name} is a trusted online store. Shop the latest deals and save with verified ${store.name} coupon codes on ${SITE_NAME}.`}</p>}
                {!store.about_content && <><p className="mt-3">We track all {store.name} promotions, flash sales, and exclusive discount codes daily so you never miss a saving opportunity. Our team manually verifies every code before publishing.</p>
                <p className="mt-3">{store.name} regularly runs seasonal sales and clearance events. Bookmark this page and check back often.</p></>}
              </div>
              {/* Internal link to category page — improves crawl graph */}
              {store.category && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Browse more</span>
                  <Link href={`/category/${store.category.toLowerCase()}`} className="text-primary-600 font-semibold hover:underline">
                    {store.category} coupons →
                  </Link>
                </div>
              )}
              {store.website_url && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <ExternalLink className="w-4 h-4 text-primary-500" aria-hidden="true" />
                  <span>Official website:</span>
                  <a href={store.website_url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="text-primary-600 font-semibold hover:underline">Visit {store.name} official website</a>
                </div>
              )}
            </div>

            {/* How to use */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">How to Use a {store.name} Coupon Code or Promo Code</h2>
              {store.how_to_use_content ? (
                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{store.how_to_use_content}</p>
              ) : (
              <ol className="space-y-4">
                {[
                  { n: 1, t: 'Find your coupon', d: `Browse verified ${store.name} codes above. Look for the highest discount or best match.` },
                  { n: 2, t: 'Click "Get Code"', d: 'Click the button. The full code is revealed in a popup and copied to your clipboard. You are also redirected to the store.' },
                  { n: 3, t: 'Shop on the website', d: 'Add products to your cart. Make sure your order meets any minimum cart value.' },
                  { n: 4, t: 'Paste code at checkout', d: 'Find the promo code field at checkout. Paste your code and click Apply to see your discount instantly.' },
                  { n: 5, t: 'Complete purchase and save!', d: 'Confirm your order — the discount is applied before payment.' },
                ].map(item => (
                  <li key={item.n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{item.n}</div>
                    <div>
                      <div className="font-bold text-gray-900 mb-0.5">{item.t}</div>
                      <div className="text-base text-gray-500 leading-relaxed">{item.d}</div>
                    </div>
                  </li>
                ))}
              </ol>
              )}
            </div>

            {/* Saving tips */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">How to Save More at {store.name} – Tips & Tricks</h2>
              <h3 className="text-sm font-semibold text-primary-600 mb-3">Top money-saving strategies for {store.name} shoppers</h3>
              {store.saving_tips_content ? (
                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{store.saving_tips_content}</p>
              ) : (
                <ul className="space-y-3">
                  {savingTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-base text-gray-600 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">{store.name} Coupon Codes – Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary-50 transition-colors list-none">
                      <span className="font-semibold text-gray-900 text-base pr-4">{faq.q}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="px-4 pb-4 pt-2 text-base text-gray-600 leading-relaxed border-t border-gray-200">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* Expired coupons */}
            {expiredCoupons.length > 0 && (
              <details className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <summary className="cursor-pointer font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2 list-none">
                  <Clock className="w-4 h-4" />
                  Show {expiredCoupons.length} Recently Expired Coupons
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </summary>
                <div className="mt-4 opacity-60 space-y-3">
                  {expiredCoupons.slice(0, 4).map(c => <CouponCard key={c.id} coupon={c} hideStore />)}
                </div>
              </details>
            )}
          </div>

          {/* ── SIDEBAR (narrow) — left on desktop, below content on mobile ─────── */}
          <div className="lg:col-span-1 space-y-5 lg:order-1">

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">{store.name} Stats</h3>
              <div className="space-y-3">
                {[
                  { l: 'Total Offers', v: allCoupons.length, I: Tag },
                  { l: 'Active Codes', v: activeCoupons.length, I: CheckCircle },
                  { l: 'Best Discount', v: maxDiscount > 0 ? `${maxDiscount}% OFF` : 'N/A', I: TrendingUp },
                ].map(({ l, v, I }) => (
                  <div key={l} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500"><I className="w-4 h-4 text-primary-400" />{l}</div>
                    <span className="font-bold text-gray-900 text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>


            {/* Real store rating widget (shows public avg only at >= 3 votes) */}
            <StoreRating storeId={store.id} storeName={store.name} initialCount={ratingCount} initialAverage={ratingAvg} />

            {/* Today's best */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Today&apos;s Best</h3>
              <div className="space-y-2">
                {[
                  { l: 'Best Coupon', v: maxDiscount > 0 ? `${maxDiscount}% OFF` : 'See Deals' },
                  { l: 'Coupon Codes', v: `${codeCoupons.length} codes` },
                  { l: 'No-Code Deals', v: `${dealCoupons.length} deals` },
                  { l: 'Free Shipping', v: freeCoupons.length > 0 ? `${freeCoupons.length} offer(s)` : 'Check page' },
                  { l: 'Total Active', v: `${activeCoupons.length} offers` },
                ].map(({ l, v }) => (
                  <div key={l} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-200 last:border-0">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-bold text-primary-600">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar stores */}
            {sidebarStores.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Similar Stores</h3>
                <div className="space-y-1">
                  {sidebarStores.map(s => (
                    <Link key={s.id} href={`/store/${s.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                        {s.logo ? <Image src={s.logo} alt={`${s.name} logo`} width={40} height={40} className="object-contain w-full h-full" /> : <Tag className="w-4 h-4 text-primary-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors truncate">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.category}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Saving tips */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-5">
              <h3 className="font-bold text-primary-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Useful Tips
              </h3>
              <ul className="space-y-2">
                {savingTips.slice(0, 4).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-primary-800">
                    <span className="text-primary-500 font-bold mt-0.5">→</span>{tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-600">Affiliate Disclosure:</strong> EndOverPay earns a commission when you click our links and make a purchase, at no extra cost to you. All coupon codes are manually verified before publishing.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
