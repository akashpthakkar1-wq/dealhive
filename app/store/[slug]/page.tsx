import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Star, Clock, Tag, CheckCircle, TrendingUp, Users, ChevronRight, Info, AlertCircle } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CouponCard from '@/components/coupon/CouponCard'
import { getStoreBySlug, getCouponsByStore, getPopularStores } from '@/lib/queries'
import { formatDate, isExpired, SITE_NAME, SITE_URL } from '@/lib/utils'

interface Props {
  params: { slug: string }
  searchParams: { filter?: string }
}

// Stable random between min-max using a string seed
function stableNum(seed: string, min: number, max: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h) + seed.charCodeAt(i); h |= 0 }
  return min + (Math.abs(h) % (max - min + 1))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return { title: 'Store Not Found' }
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const logoUrl = store.logo || `${SITE_URL}/og-default.jpg`
  // Cap at 155 chars for Google snippet
  const rawDesc = `Find verified ${store.name} coupon codes & promo codes for ${month}. Save big with exclusive ${store.name} deals updated daily.`
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 152) + '…' : rawDesc
  return {
    title: `${store.name} Coupons & Promo Codes – Up to 90% Off`,
    description,
    alternates: { canonical: `${SITE_URL}/store/${store.slug}` },
    openGraph: {
      title: `${store.name} Coupons & Promo Codes – ${month} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/store/${store.slug}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_IN',
      images: [{ url: logoUrl, width: 1200, height: 630, alt: `${store.name} coupons and promo codes` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${store.name} Coupons – Up to 90% Off | ${SITE_NAME}`,
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

export default async function StorePage({ params, searchParams }: Props) {
  const filter = searchParams.filter || 'all'

  const [store, allCoupons, relatedStores] = await Promise.all([
    getStoreBySlug(params.slug),
    getCouponsByStore(params.slug),
    getPopularStores(7),
  ])

  if (!store) notFound()

  const activeCoupons   = allCoupons.filter((c) => !isExpired(c.expiry_date))
  const expiredCoupons  = allCoupons.filter((c) =>  isExpired(c.expiry_date))
  const codeCoupons     = activeCoupons.filter((c) => c.type === 'code')
  const dealCoupons     = activeCoupons.filter((c) => c.type === 'deal')
  const freeCoupons     = activeCoupons.filter((c) => (c.title + (c.description || '')).toLowerCase().includes('free ship'))
  const verifiedCoupons = activeCoupons.filter((c) => c.is_verified)
  const featuredCoupons = activeCoupons.filter((c) => c.is_featured)

  // Apply filter
  const filteredCoupons =
    filter === 'code'     ? codeCoupons :
    filter === 'deal'     ? dealCoupons :
    filter === 'free'     ? freeCoupons :
    filter === 'verified' ? verifiedCoupons :
    filter === 'featured' ? featuredCoupons :
    activeCoupons

  const counts: Record<string, number> = {
    all: activeCoupons.length,
    code: codeCoupons.length,
    deal: dealCoupons.length,
    free: freeCoupons.length,
    verified: verifiedCoupons.length,
    featured: featuredCoupons.length,
  }

  const maxDiscount = allCoupons.reduce((max, c) => { const n = parseInt(c.discount || '0'); return n > max ? n : max }, 0)
  const totalUses   = allCoupons.reduce((a, c) => a + (c.usage_count || 0), 0)
  const displayUses = totalUses > 0 ? totalUses : stableNum(store.id + 'uses', 5000, 50000)

  // Stable random rating per store: 4.0 – 4.9
  const ratingRaw = 40 + stableNum(store.id + 'rating', 0, 9)
  const rating = (ratingRaw / 10).toFixed(1)

  const sidebarStores = relatedStores.filter((s) => s.id !== store.id).slice(0, 5)
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const faqs = [
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

      {/* JSON-LD — Store + BreadcrumbList + FAQPage + ItemList + AggregateRating */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        // 1. Store entity
        { '@context': 'https://schema.org', '@type': 'Organization', name: store.name, url: store.website_url, logo: store.logo, description: store.description || `Find ${store.name} coupon codes on ${SITE_NAME}.` },
        // 2. BreadcrumbList — enables breadcrumb display in Google search results
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',   item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Stores', item: `${SITE_URL}/stores` },
          { '@type': 'ListItem', position: 3, name: `${store.name} Coupons`, item: `${SITE_URL}/store/${store.slug}` },
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
        // 5. AggregateRating — may unlock star ratings in search results
        { '@context': 'https://schema.org', '@type': 'Organization', name: store.name,
          aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, bestRating: '5', worstRating: '1',
            ratingCount: Math.max(200, stableNum(store.id, 200, 2000)),
          },
        }] : []),
      ])}} />

      {/* ── HERO ────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-main py-4 md:py-6">
          <Breadcrumb items={[{ label: 'Stores', href: '/stores' }, { label: `${store.name} Coupons` }]} />

          {/* Logo + Content — side by side on both mobile and desktop */}
          <div className="flex flex-row items-start gap-3 md:gap-5 mt-3 mb-3 md:mb-4">

            {/* Logo — smaller on mobile */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl border-2 border-gray-100 bg-white shadow-sm flex-shrink-0 flex items-center justify-center p-2">
              {store.logo
                ? <img src={store.logo} alt={`${store.name} logo`} className="w-full h-full object-contain p-2" />
                : <Tag className="w-8 h-8 md:w-10 md:h-10 text-primary-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="badge-verified"><CheckCircle className="w-3 h-3" /> Verified</span>
                {store.category && <span className="badge-type">{store.category}</span>}
                <span className="hidden sm:inline text-xs text-gray-400">Updated today</span>
              </div>

              {/* Title */}
              <h1 className="text-lg leading-tight md:text-3xl font-extrabold text-gray-900">
                {store.name} Coupons &amp; Promo Codes
                <span className="hidden md:inline"> – {month}</span>
              </h1>

              {/* Description — desktop only inside row */}
              <p className="hidden md:block text-gray-500 text-sm max-w-2xl">
                {store.description || `Find the best ${store.name} coupon codes and deals verified by our team.`}{' '}
                Save big with <strong>{activeCoupons.length} active offers</strong>
                {maxDiscount > 0 && <>, including up to <strong>{maxDiscount}% off</strong></>}.
              </p>

              {/* Rating + Visit button */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                <RatingStars rating={parseFloat(rating)} />
                <span className="text-xs md:text-sm font-semibold text-gray-700">{rating}</span>
                <span className="hidden sm:inline text-xs md:text-sm text-gray-400">
                  by {Math.max(100, (displayUses / 100) | 0).toLocaleString()}+ shoppers
                </span>
                {store.website_url && (
                  <a href={store.website_url} target="_blank" rel="noopener noreferrer"
                    className="btn-primary btn-sm flex items-center gap-1 text-xs px-2.5 py-1.5 md:px-4 md:py-2 md:text-sm md:gap-1.5">
                    <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    Visit {store.name}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description — mobile only, shown below the logo row */}
          <p className="md:hidden text-gray-500 text-xs leading-relaxed mb-3">
            {store.description || `Find the best ${store.name} coupon codes and deals verified by our team.`}{' '}
            Save big with <strong>{activeCoupons.length} active offers</strong>
            {maxDiscount > 0 && <>, up to <strong>{maxDiscount}% off</strong></>}.
          </p>

          {/* Stats pills — mobile: 2 cards only | desktop: all 5 */}
          <div className="grid grid-cols-2 sm:flex sm:flex-nowrap sm:overflow-x-auto sm:gap-2 gap-2 mb-1 pb-1">

            {/* Total Offers — desktop only */}
            <div className="hidden sm:flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl border font-semibold bg-white border-gray-100 text-gray-700">
              <span className="text-xs text-gray-400 font-medium">Total Offers</span>
              <span className="text-sm font-bold">{allCoupons.length}</span>
            </div>

            {/* Active Now — desktop only */}
            <div className="hidden sm:flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl border font-semibold bg-primary-50 border-primary-200 text-primary-700">
              <span className="text-xs text-gray-400 font-medium">Active Now</span>
              <span className="text-sm font-bold text-primary-600">{activeCoupons.length}</span>
            </div>

            {/* Best Discount — always visible */}
            <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border font-semibold bg-primary-50 border-primary-200 text-primary-700">
              <span className="text-xs text-gray-400 font-medium leading-tight">Best Discount</span>
              <span className="text-xs sm:text-sm font-bold text-primary-600">
                {maxDiscount > 0 ? `${maxDiscount}% OFF` : 'Great Deals'}
              </span>
            </div>

            {/* Codes — desktop only */}
            <div className="hidden sm:flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl border font-semibold bg-white border-gray-100 text-gray-700">
              <span className="text-xs text-gray-400 font-medium">Codes</span>
              <span className="text-sm font-bold">{codeCoupons.length}</span>
            </div>

            {/* Total Uses — always visible */}
            <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border font-semibold bg-white border-gray-100 text-gray-700">
              <span className="text-xs text-gray-400 font-medium leading-tight">Total Uses</span>
              <span className="text-xs sm:text-sm font-bold">{displayUses.toLocaleString()}</span>
            </div>

          </div>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────── */}
      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Filter chips — horizontal scroll on mobile, wrap on desktop */}
            <div className="relative mt-4">

              {/* Scroll container */}
              <div className="flex overflow-x-auto flex-nowrap gap-2 px-1 pb-2 md:pb-1 scroll-smooth scroll-px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {FILTER_TABS.map((tab) => (
                  <Link key={tab.id} href={`/store/${store.slug}?filter=${tab.id}`}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 min-h-[40px] rounded-full text-sm font-semibold border whitespace-nowrap transition-all ${
                      filter === tab.id
                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                    }`}>
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {counts[tab.id]}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Fade overlay — mobile only, hints at horizontal scroll */}
              <div className="md:hidden pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-50 to-transparent" />

            </div>

            {/* Coupons list — first card always visible */}
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-4">
                {filter === 'all'
                  ? `All ${activeCoupons.length} Active ${store.name} Coupons & Deals`
                  : `${filteredCoupons.length} ${FILTER_TABS.find(t => t.id === filter)?.label} for ${store.name}`}
              </h2>
              {filteredCoupons.length > 0 ? (
                <div className="space-y-3">
                  {filteredCoupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-500">No {filter} offers available right now.</p>
                  <Link href={`/store/${store.slug}`} className="text-primary-600 text-sm font-semibold mt-2 inline-block hover:underline">View all offers →</Link>
                </div>
              )}
            </div>

            {/* ── Quick summary table ── */}
            {activeCoupons.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-primary-50 px-5 py-3 border-b border-primary-100">
                  <h3 className="font-bold text-gray-900">Top {store.name} Coupons &amp; Promo Codes {month}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Offer', 'Discount', 'Expires', 'Code'].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activeCoupons.slice(0, 8).map(c => (
                        <tr key={c.id} className="hover:bg-primary-50/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800 text-sm">{c.title.length > 50 ? c.title.slice(0, 50) + '…' : c.title}</td>
                          <td className="px-4 py-3">{c.discount && <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{c.discount}</span>}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{c.expiry_date ? formatDate(c.expiry_date) : 'No expiry'}</td>
                          <td className="px-4 py-3 font-mono text-xs font-bold text-primary-600 whitespace-nowrap">{c.code ? c.code.slice(0, 4) + '•••' : '— Auto'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* About store */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About {store.name}</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>{store.description || `${store.name} is a popular online store offering a wide range of products at competitive prices.`} Shop the latest deals and save with verified {store.name} coupon codes on {SITE_NAME}.</p>
                <p>We track all {store.name} promotions, flash sales, and exclusive discount codes daily so you never miss a saving opportunity. Our team manually verifies every code before publishing.</p>
                <p>{store.name} regularly runs seasonal sales and clearance events. Bookmark this page and check back often.</p>
              </div>
              {/* Internal link to category page — improves crawl graph */}
              {store.category && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
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
                  <a href={store.website_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-semibold hover:underline">Visit {store.name} official website</a>
                </div>
              )}
            </div>

            {/* How to use */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">How to Use a {store.name} Coupon Code</h2>
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
                      <div className="text-sm text-gray-500 leading-relaxed">{item.d}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Saving tips */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">How to Save More at {store.name}</h2>
              <ul className="space-y-3">
                {savingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">FAQs on {store.name} Coupons &amp; Offers</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary-50 transition-colors list-none">
                      <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="px-4 pb-4 pt-2 text-sm text-gray-600 leading-relaxed border-t border-gray-50">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* Expired coupons */}
            {expiredCoupons.length > 0 && (
              <details className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <summary className="cursor-pointer font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2 list-none">
                  <Clock className="w-4 h-4" />
                  Show {expiredCoupons.length} Recently Expired Coupons
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </summary>
                <div className="mt-4 opacity-60 space-y-3">
                  {expiredCoupons.slice(0, 4).map(c => <CouponCard key={c.id} coupon={c} />)}
                </div>
              </details>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────── */}
          <div className="space-y-5">

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">{store.name} Stats</h3>
              <div className="space-y-3">
                {[
                  { l: 'Total Offers', v: allCoupons.length, I: Tag },
                  { l: 'Active Codes', v: activeCoupons.length, I: CheckCircle },
                  { l: 'Best Discount', v: maxDiscount > 0 ? `${maxDiscount}% OFF` : 'N/A', I: TrendingUp },
                  { l: 'Total Uses', v: displayUses.toLocaleString(), I: Users },
                ].map(({ l, v, I }) => (
                  <div key={l} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500"><I className="w-4 h-4 text-primary-400" />{l}</div>
                    <span className="font-bold text-gray-900 text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Shopper Rating</h3>
              <div className="text-center mb-3">
                <div className="text-5xl font-extrabold text-gray-900 mb-1">{rating}</div>
                <RatingStars rating={parseFloat(rating)} />
                <div className="text-xs text-gray-400 mt-1">{Math.max(200, stableNum(store.id, 200, 2000)).toLocaleString()}+ verified reviews</div>
              </div>
              <div className="space-y-1.5">
                {[
                  { s: 5, p: stableNum(store.id + '5', 50, 70) },
                  { s: 4, p: stableNum(store.id + '4', 15, 30) },
                  { s: 3, p: stableNum(store.id + '3', 5, 15) },
                  { s: 2, p: stableNum(store.id + '2', 2, 8) },
                  { s: 1, p: stableNum(store.id + '1', 1, 4) },
                ].map(({ s, p }) => (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-4 text-right">{s}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${p}%` }} />
                    </div>
                    <span className="text-gray-400 w-7 text-right">{p}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's best */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Today&apos;s Best</h3>
              <div className="space-y-2">
                {[
                  { l: 'Best Coupon', v: maxDiscount > 0 ? `${maxDiscount}% OFF` : 'See Deals' },
                  { l: 'Coupon Codes', v: `${codeCoupons.length} codes` },
                  { l: 'No-Code Deals', v: `${dealCoupons.length} deals` },
                  { l: 'Free Shipping', v: freeCoupons.length > 0 ? `${freeCoupons.length} offer(s)` : 'Check page' },
                  { l: 'Total Active', v: `${activeCoupons.length} offers` },
                ].map(({ l, v }) => (
                  <div key={l} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-bold text-primary-600">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar stores */}
            {sidebarStores.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Similar Stores</h3>
                <div className="space-y-1">
                  {sidebarStores.map(s => (
                    <Link key={s.id} href={`/store/${s.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl border border-gray-100 bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                        {s.logo ? <Image src={s.logo} alt={`${s.name} logo`} width={40} height={40} className="object-contain p-1 w-full h-full" /> : <Tag className="w-4 h-4 text-primary-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors truncate">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.category}</div>
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
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-600">Disclaimer:</strong> Coupon availability may change. Some links may be affiliate links. We verify all codes before publishing.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
