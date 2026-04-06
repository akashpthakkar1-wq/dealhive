import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ExternalLink, Star, Shield, Clock, Tag } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CouponGrid from '@/components/coupon/CouponGrid'
import { getStoreBySlug, getCouponsByStore } from '@/lib/queries'
import { SITE_NAME } from '@/lib/utils'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug)
  if (!store) return { title: 'Store Not Found' }
  return {
    title: `${store.name} Coupons & Deals – Up to 90% Off | ${SITE_NAME}`,
    description: `Find verified ${store.name} coupon codes and deals. Save big with exclusive offers. ${store.description || ''}`,
    openGraph: {
      title: `${store.name} Coupons | ${SITE_NAME}`,
      description: `Best ${store.name} deals and promo codes`,
      images: store.logo ? [{ url: store.logo }] : [],
    },
  }
}

export default async function StorePage({ params }: Props) {
  const [store, coupons] = await Promise.all([
    getStoreBySlug(params.slug),
    getCouponsByStore(params.slug),
  ])

  if (!store) notFound()

  const activeCoupons = coupons.filter((c) => {
    if (!c.expiry_date) return true
    return new Date(c.expiry_date) >= new Date()
  })
  const expiredCoupons = coupons.filter((c) => {
    if (!c.expiry_date) return false
    return new Date(c.expiry_date) < new Date()
  })

  const maxDiscount = coupons.reduce((max, c) => {
    const n = parseInt(c.discount || '0')
    return n > max ? n : max
  }, 0)

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: 'Stores', href: '/search' }, { label: store.name }]} />

      {/* Store hero */}
      <div className="card p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm flex-shrink-0 flex items-center justify-center">
          {store.logo ? (
            <Image src={store.logo} alt={store.name} width={80} height={80} className="object-contain p-1" />
          ) : (
            <Tag className="w-10 h-10 text-orange-400" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="badge-verified"><Shield className="w-3 h-3" /> Verified Store</span>
            {store.category && (
              <span className="badge-type">{store.category}</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
            {store.name} Coupons & Deals
          </h1>
          {store.description && (
            <p className="text-gray-500 text-sm mb-3">{store.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-orange-500" />
              <strong className="text-gray-800">{activeCoupons.length}</strong> Active Offers
            </div>
            {maxDiscount > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500" />
                Up to <strong className="text-gray-800">{maxDiscount}% OFF</strong>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              Updated today
            </div>
          </div>
        </div>

        {store.website_url && (
          <a href={store.website_url} target="_blank" rel="noopener noreferrer"
            className="btn-primary flex-shrink-0">
            <ExternalLink className="w-4 h-4" />
            Visit Store
          </a>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { val: coupons.length, label: 'Total Offers' },
          { val: activeCoupons.length, label: 'Active Coupons' },
          { val: maxDiscount > 0 ? `${maxDiscount}%` : 'N/A', label: 'Max Discount' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl font-extrabold text-orange-600">{s.val}</div>
            <div className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${store.name} Coupons`,
          description: `Best ${store.name} coupon codes and deals`,
          numberOfItems: activeCoupons.length,
          itemListElement: activeCoupons.slice(0, 10).map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Offer',
              name: c.title,
              description: c.description,
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/coupon/${c.slug}`,
            },
          })),
        })
      }} />

      {/* Active coupons */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {activeCoupons.length > 0 ? `${activeCoupons.length} Active ${store.name} Coupons` : 'Coupons'}
      </h2>
      <CouponGrid coupons={activeCoupons} emptyMessage={`No active coupons for ${store.name} right now. Check back soon!`} />

      {/* Expired coupons */}
      {expiredCoupons.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer text-sm font-semibold text-gray-400 hover:text-gray-600 mb-4">
            Show {expiredCoupons.length} Expired Coupons
          </summary>
          <div className="mt-4 opacity-60">
            <CouponGrid coupons={expiredCoupons} />
          </div>
        </details>
      )}
    </div>
  )
}
