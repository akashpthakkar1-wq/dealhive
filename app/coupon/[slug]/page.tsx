import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle, Clock, Users, Tag, ExternalLink } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CouponGrid from '@/components/coupon/CouponGrid'
import CouponCard from '@/components/coupon/CouponCard'
import { getCouponBySlug, getCoupons } from '@/lib/queries'
import { formatDate, isExpired, getFakeUsageCount, SITE_NAME, SITE_URL } from '@/lib/utils'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const coupon = await getCouponBySlug(params.slug)
  if (!coupon) return { title: 'Coupon Not Found' }
  const storeName = (coupon.store as any)?.name || ''
  return {
    title: `${coupon.title} – ${storeName} Coupon Code | ${SITE_NAME}`,
    description: coupon.description || `Get ${coupon.discount || 'discount'} off with this verified ${storeName} coupon code. ${coupon.code ? `Use code: ${coupon.code}` : 'No code needed.'}`,
    openGraph: {
      title: `${coupon.title} | ${SITE_NAME}`,
      description: coupon.description || '',
    },
  }
}

export default async function CouponPage({ params }: Props) {
  const coupon = await getCouponBySlug(params.slug)
  if (!coupon) notFound()

  const storeName = (coupon.store as any)?.name || 'Store'
  const storeSlug = (coupon.store as any)?.slug || ''
  const storeLogo = (coupon.store as any)?.logo
  const expired = isExpired(coupon.expiry_date)
  const usageCount = coupon.usage_count || getFakeUsageCount(coupon.id)

  // Related coupons
  const related = await getCoupons({ storeId: coupon.store_id || undefined, excludeExpired: true, limit: 4 })
  const relatedFiltered = related.filter((c) => c.id !== coupon.id)

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[
        { label: 'All Deals', href: '/search' },
        { label: storeName, href: `/store/${storeSlug}` },
        { label: coupon.title },
      ]} />

      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Offer',
          name: coupon.title,
          description: coupon.description,
          url: `${SITE_URL}/coupon/${coupon.slug}`,
          priceSpecification: { '@type': 'PriceSpecification', discount: coupon.discount },
          validThrough: coupon.expiry_date,
          offeredBy: { '@type': 'Organization', name: storeName },
        })
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main coupon */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            {/* Header band */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
              <div className="text-5xl font-extrabold mb-1">
                {coupon.discount || (coupon.type === 'deal' ? 'DEAL' : 'CODE')}
              </div>
              <div className="text-orange-100 font-semibold text-lg">
                {coupon.type === 'code' ? 'Use Coupon Code' : 'Activate This Deal'}
              </div>
            </div>

            <div className="p-6">
              {/* Store */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl border border-gray-100 overflow-hidden bg-white flex items-center justify-center">
                  {storeLogo ? (
                    <Image src={storeLogo} alt={storeName} width={40} height={40} className="object-contain p-0.5" />
                  ) : (
                    <Tag className="w-5 h-5 text-orange-400" />
                  )}
                </div>
                <div>
                  <a href={`/store/${storeSlug}`} className="font-bold text-orange-600 hover:text-orange-700">{storeName}</a>
                  <div className="text-xs text-gray-400">Verified Store</div>
                </div>
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-3">{coupon.title}</h1>
              {coupon.description && (
                <p className="text-gray-600 mb-4">{coupon.description}</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                {coupon.is_verified && <span className="badge-verified"><CheckCircle className="w-3 h-3" /> Verified</span>}
                {expired && <span className="badge-expired">Expired</span>}
                <span className="badge-type">{coupon.type === 'code' ? 'Coupon Code' : 'Deal'}</span>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Expires</div>
                    <div className="font-semibold text-gray-800">{formatDate(coupon.expiry_date)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="text-xs text-gray-400 font-medium">Times Used</div>
                    <div className="font-semibold text-gray-800">{usageCount.toLocaleString()} times</div>
                  </div>
                </div>
              </div>

              {/* The coupon card (handles reveal/click) */}
              <CouponCard coupon={coupon} />
            </div>
          </div>

          {/* How to use */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">How to Use This {coupon.type === 'code' ? 'Coupon Code' : 'Deal'}</h2>
            <ol className="space-y-3">
              {[
                coupon.type === 'code' ? 'Click "Get Code" to reveal the coupon code' : 'Click "Activate Deal" button above',
                `You will be redirected to ${storeName}'s website`,
                coupon.type === 'code' ? 'Add items to your cart and proceed to checkout' : 'Browse the sale/offer section on their website',
                coupon.type === 'code' ? 'Paste the coupon code in the promo code field' : 'The discount will be automatically applied',
                'Complete your purchase and enjoy the savings!',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Store Info</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl border border-gray-100 bg-white overflow-hidden flex items-center justify-center">
                {storeLogo ? (
                  <Image src={storeLogo} alt={storeName} width={48} height={48} className="object-contain p-1" />
                ) : <Tag className="w-6 h-6 text-orange-400" />}
              </div>
              <div className="font-bold text-gray-900">{storeName}</div>
            </div>
            <a href={`/store/${storeSlug}`}
              className="btn-secondary w-full text-sm py-2 flex items-center justify-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              All {storeName} Coupons
            </a>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-1">Disclaimer</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Coupon availability may change. We verify all codes before publishing but cannot guarantee they will work at all times. 
              Some links on this page may be affiliate links.
            </p>
          </div>
        </div>
      </div>

      {/* Related coupons */}
      {relatedFiltered.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">More {storeName} Coupons</h2>
          <CouponGrid coupons={relatedFiltered} />
        </div>
      )}
    </div>
  )
}
