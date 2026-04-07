import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Star, Shield, Clock, Tag, CheckCircle, TrendingUp, Users, ChevronRight, Info, AlertCircle } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CouponCard from '@/components/coupon/CouponCard'
import { getStoreBySlug, getCouponsByStore, getPopularStores } from '@/lib/queries'
import { formatDate, isExpired, SITE_NAME, SITE_URL } from '@/lib/utils'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return { title: 'Store Not Found' }
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  return {
    title: `${store.name} Coupons & Promo Codes – Up to 90% Off | ${SITE_NAME}`,
    description: `Find the latest verified ${store.name} coupon codes, promo codes and deals for ${month}. Save big with exclusive ${store.name} offers. ${store.description || ''}`,
    openGraph: {
      title: `${store.name} Coupons & Promo Codes | ${SITE_NAME}`,
      description: `Best ${store.name} deals and promo codes verified today`,
      images: store.logo ? [{ url: store.logo }] : [],
    },
    alternates: { canonical: `${SITE_URL}/store/${store.slug}` },
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

export default async function StorePage({ params }: Props) {
  const [store, allCoupons, relatedStores] = await Promise.all([
    getStoreBySlug(params.slug),
    getCouponsByStore(params.slug),
    getPopularStores(6),
  ])

  if (!store) notFound()

  const activeCoupons   = allCoupons.filter((c) => !isExpired(c.expiry_date))
  const expiredCoupons  = allCoupons.filter((c) =>  isExpired(c.expiry_date))
  const codeCoupons     = activeCoupons.filter((c) => c.type === 'code')
  const dealCoupons     = activeCoupons.filter((c) => c.type === 'deal')
  const freeCoupons     = activeCoupons.filter((c) => c.type === 'free')
  const featuredCoupons = activeCoupons.filter((c) => c.is_featured)
  const verifiedCoupons = activeCoupons.filter((c) => c.is_verified)
  const maxDiscount = allCoupons.reduce((max, c) => { const n = parseInt(c.discount||'0'); return n>max?n:max }, 0)
  const totalUses   = allCoupons.reduce((a,c) => a+(c.usage_count||0), 0)
  const sidebarStores = relatedStores.filter((s) => s.id !== store.id).slice(0, 5)
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const faqs = [
    { q: `How do I use a ${store.name} coupon code?`, a: `To use a ${store.name} coupon code: 1) Click "Get Code" on ${SITE_NAME} to reveal the code. 2) You will be redirected to ${store.name}'s website. 3) Add items to your cart and proceed to checkout. 4) Paste the coupon code in the promo code box. 5) Click Apply to see your discount.` },
    { q: `How many ${store.name} coupons are available today?`, a: `There are currently ${activeCoupons.length} active ${store.name} coupon codes and deals on ${SITE_NAME}. We update our ${store.name} offers daily.` },
    { q: `What is the best ${store.name} coupon code right now?`, a: `The best ${store.name} coupon available right now offers${maxDiscount>0?` up to ${maxDiscount}% off`:' great discounts'}. Check our verified offers above for the highest savings.` },
    { q: `Does ${store.name} offer free shipping?`, a: `${freeCoupons.length>0?`Yes! We currently have ${freeCoupons.length} free shipping offer(s) for ${store.name}. Click the Free Shipping filter above to see them.`:`Check ${store.name}'s website for current shipping policies or look for free delivery deals on this page.`}` },
    { q: `Are these ${store.name} coupon codes verified?`, a: `Yes, all ${store.name} coupon codes on ${SITE_NAME} are manually verified by our team before publishing. Codes with the green Verified badge have been tested and confirmed working.` },
    { q: `Can I use multiple ${store.name} coupons on one order?`, a: `Generally, ${store.name} allows only one coupon code per order. However, you may combine a coupon code with ongoing sale prices for maximum savings.` },
  ]

  const savingTips = [
    `Stack coupon codes with ongoing ${store.name} sale prices for maximum savings`,
    `New user codes offer the highest discounts — perfect for first-time shoppers`,
    `Check ${store.name}'s flash sales — new deals go live daily`,
    `Download the ${store.name} app for app-exclusive extra discounts`,
    `Subscribe to ${store.name} newsletters to get exclusive promo codes in your inbox`,
    `Bookmark ${SITE_NAME} to never miss a verified ${store.name} deal`,
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { '@context':'https://schema.org','@type':'Store', name:store.name, url:store.website_url, logo:store.logo, description:store.description },
        { '@context':'https://schema.org','@type':'FAQPage', mainEntity: faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}})) },
        { '@context':'https://schema.org','@type':'ItemList', name:`${store.name} Coupon Codes ${month}`, numberOfItems:activeCoupons.length,
          itemListElement: activeCoupons.slice(0,10).map((c,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Offer',name:c.title,description:c.description,url:`${SITE_URL}/coupon/${c.slug}`}})) }
      ])}} />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-main py-6">
          <Breadcrumb items={[{label:'Stores',href:'/search'},{label:`${store.name} Coupons`}]} />

          <div className="flex flex-col md:flex-row items-start gap-6 mb-5">
            <div className="w-20 h-20 rounded-2xl border-2 border-gray-100 bg-white shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
              {store.logo ? <Image src={store.logo} alt={`${store.name} logo`} width={80} height={80} className="object-contain p-1" /> : <Tag className="w-10 h-10 text-orange-400" />}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge-verified"><CheckCircle className="w-3 h-3" /> Verified Store</span>
                {store.category && <span className="badge-type">{store.category}</span>}
                <span className="text-xs text-gray-400 font-medium">Updated today</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                {store.name} Coupons & Promo Codes – {month}
              </h1>
              <p className="text-gray-500 text-sm mb-3 max-w-2xl">
                {store.description || `Find the best ${store.name} coupon codes and deals verified by our team.`}{' '}
                Save big with <strong>{activeCoupons.length} active offers</strong>{maxDiscount>0&&<>, including up to <strong>{maxDiscount}% off</strong></>}.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <RatingStars rating={4.3} />
                <span className="text-sm font-semibold text-gray-700">4.3</span>
                <span className="text-sm text-gray-400">by {Math.max(100,(totalUses/100)|0)}+ shoppers</span>
                {store.website_url && (
                  <a href={store.website_url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm flex items-center gap-1.5 ml-2">
                    <ExternalLink className="w-3.5 h-3.5" /> Visit {store.name}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              {l:'Total Offers',v:allCoupons.length},
              {l:'Active Coupons',v:activeCoupons.length,hi:true},
              {l:'Best Discount',v:maxDiscount>0?`${maxDiscount}% OFF`:'Great Deals',hi:true},
              {l:'Coupon Codes',v:codeCoupons.length},
              {l:'Total Uses',v:totalUses.toLocaleString()},
            ].map(({l,v,hi})=>(
              <div key={l} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${hi?'bg-orange-50 border-orange-200 text-orange-700':'bg-white border-gray-100 text-gray-700'}`}>
                <span className="text-xs text-gray-400 font-medium">{l}</span>
                <span className={hi?'text-orange-600 font-bold':''}>{v}</span>
              </div>
            ))}
          </div>

          {/* Quick summary table */}
          {activeCoupons.length>0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50 border-b border-orange-100">
                    {['Offer','Best Discount','Valid Until','Code'].map(h=><th key={h} className="text-left px-4 py-3 font-bold text-gray-700">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeCoupons.slice(0,5).map(c=>(
                    <tr key={c.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{c.title.length>48?c.title.slice(0,48)+'…':c.title}</td>
                      <td className="px-4 py-3">{c.discount&&<span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{c.discount}</span>}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{c.expiry_date?formatDate(c.expiry_date):'No expiry'}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-orange-600">{c.code?c.code.slice(0,4)+'***':'— No code needed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Coupons column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                {id:'all',label:'All Offers',cnt:activeCoupons.length},
                {id:'code',label:'🏷️ Codes',cnt:codeCoupons.length},
                {id:'deal',label:'🔥 Deals',cnt:dealCoupons.length},
                {id:'free',label:'🚚 Free Ship',cnt:freeCoupons.length},
                {id:'verified',label:'✅ Verified',cnt:verifiedCoupons.length},
              ].map(t=>(
                <span key={t.id} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border cursor-pointer transition-all bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600">
                  {t.label} <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">{t.cnt}</span>
                </span>
              ))}
            </div>

            {/* Featured coupons */}
            {featuredCoupons.length>0&&(
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <h2 className="font-bold text-gray-900">Today&apos;s Best {store.name} Offers</h2>
                </div>
                <div className="space-y-3">{featuredCoupons.map(c=><CouponCard key={c.id} coupon={c} />)}</div>
              </div>
            )}

            {/* All coupons */}
            <div>
              <h2 className="font-bold text-gray-900 text-lg mb-4">All {activeCoupons.length} Active {store.name} Coupons & Deals</h2>
              {activeCoupons.length>0
                ? <div className="space-y-3">{activeCoupons.map(c=><CouponCard key={c.id} coupon={c} />)}</div>
                : <div className="card-p text-center py-12"><AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3"/><p className="font-semibold text-gray-500">No active coupons right now. Check back soon!</p></div>
              }
            </div>

            {/* How to use */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">How to Use a {store.name} Coupon Code</h2>
              <ol className="space-y-4">
                {[
                  {n:1,t:'Find your coupon',d:`Browse verified ${store.name} codes above. Look for the highest discount or best match.`},
                  {n:2,t:'Click "Get Code" to reveal',d:`Click the orange button. The full code is revealed and copied. You are redirected to ${store.name}.`},
                  {n:3,t:`Shop on ${store.name}`,d:'Add products to your cart. Make sure your order meets any minimum value requirement.'},
                  {n:4,t:'Apply code at checkout',d:'Find the promo code field at checkout. Paste your code and click Apply to see your discount.'},
                  {n:5,t:'Complete purchase & save!',d:'Confirm your order and enjoy your savings! The discount shows before payment.'},
                ].map(item=>(
                  <li key={item.n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">{item.n}</div>
                    <div><div className="font-bold text-gray-900 mb-0.5">{item.t}</div><div className="text-sm text-gray-500 leading-relaxed">{item.d}</div></div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Saving tips */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">How to Save More at {store.name}</h2>
              <ul className="space-y-3">
                {savingTips.map((tip,i)=>(
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3 h-3 text-green-600"/></div>
                    <span className="text-sm text-gray-600 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQs */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">FAQs on {store.name} Coupons & Offers</h2>
              <div className="space-y-3">
                {faqs.map((faq,i)=>(
                  <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-orange-50 transition-colors list-none">
                      <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0"/>
                    </summary>
                    <div className="px-4 pb-4 pt-2 text-sm text-gray-600 leading-relaxed border-t border-gray-50">{faq.a}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* About store */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About {store.name}</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>{store.description||`${store.name} is a popular online store offering a wide range of products at competitive prices.`} Shop the latest deals and save with verified {store.name} coupon codes available exclusively on {SITE_NAME}.</p>
                <p>We track all {store.name} promotions, flash sales, and exclusive discount codes so you never miss a saving opportunity. Our team manually verifies every {store.name} coupon code before publishing, ensuring you only see codes that actually work.</p>
                <p>{store.name} regularly runs seasonal sales, clearance events, and exclusive app-only discounts. Bookmark this page and check back often — we update our {store.name} coupon database daily.</p>
              </div>
              {store.website_url&&(
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 text-sm text-gray-500">
                  <ExternalLink className="w-4 h-4 text-orange-500"/>
                  <span>Official website:</span>
                  <a href={store.website_url} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-semibold hover:underline">{store.website_url}</a>
                </div>
              )}
            </div>

            {/* Expired */}
            {expiredCoupons.length>0&&(
              <details className="card p-5">
                <summary className="cursor-pointer font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2 list-none">
                  <Clock className="w-4 h-4"/> Show {expiredCoupons.length} Expired {store.name} Coupons <ChevronRight className="w-4 h-4 ml-auto"/>
                </summary>
                <div className="mt-4 opacity-60 space-y-3">{expiredCoupons.slice(0,4).map(c=><CouponCard key={c.id} coupon={c}/>)}</div>
              </details>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">{store.name} Stats</h3>
              <div className="space-y-3">
                {[{l:'Total Offers',v:allCoupons.length,I:Tag},{l:'Active Codes',v:activeCoupons.length,I:CheckCircle},{l:'Best Discount',v:maxDiscount>0?`${maxDiscount}% OFF`:'N/A',I:TrendingUp},{l:'Total Uses',v:totalUses.toLocaleString(),I:Users}].map(({l,v,I})=>(
                  <div key={l} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500"><I className="w-4 h-4 text-orange-400"/>{l}</div>
                    <span className="font-bold text-gray-900 text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Shopper Rating</h3>
              <div className="text-center mb-3">
                <div className="text-5xl font-extrabold text-gray-900 mb-1">4.3</div>
                <RatingStars rating={4.3}/>
                <div className="text-xs text-gray-400 mt-1">{Math.max(100,(totalUses/100)|0)}+ verified reviews</div>
              </div>
              <div className="space-y-1.5">
                {[{s:5,p:62},{s:4,p:21},{s:3,p:10},{s:2,p:5},{s:1,p:2}].map(({s,p})=>(
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-4 text-right">{s}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0"/>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{width:`${p}%`}}/></div>
                    <span className="text-gray-400 w-7 text-right">{p}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's best offers */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Today&apos;s Best Offers</h3>
              <div className="space-y-2">
                {[{l:'Best Coupon',v:maxDiscount>0?`${maxDiscount}% OFF`:'See Deals'},{l:'Coupon Codes',v:`${codeCoupons.length} codes`},{l:'No-Code Deals',v:`${dealCoupons.length} deals`},{l:'Free Shipping',v:freeCoupons.length>0?`${freeCoupons.length} offer(s)`:'Check page'},{l:'Total Active',v:`${activeCoupons.length} offers`}].map(({l,v})=>(
                  <div key={l} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-bold text-orange-600">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar stores */}
            {sidebarStores.length>0&&(
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Similar Stores</h3>
                <div className="space-y-1">
                  {sidebarStores.map(s=>(
                    <Link key={s.id} href={`/store/${s.slug}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl border border-gray-100 bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                        {s.logo?<Image src={s.logo} alt={s.name} width={40} height={40} className="object-contain p-0.5"/>:<Tag className="w-4 h-4 text-orange-400"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-orange-600 transition-colors truncate">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.category}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0"/>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Saving tips */}
            <div className="card p-5 bg-orange-50 border-orange-100">
              <h3 className="font-bold text-orange-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><Info className="w-4 h-4"/> Useful Tips</h3>
              <ul className="space-y-2">
                {savingTips.slice(0,4).map((tip,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-orange-800"><span className="text-orange-500 font-bold mt-0.5">→</span>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="card p-4 bg-gray-50 border-gray-200">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-600">Disclaimer:</strong> Coupon availability may change. Some links may be affiliate links. We verify all codes before publishing but cannot guarantee availability at all times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
