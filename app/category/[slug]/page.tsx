import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CouponGrid from '@/components/coupon/CouponGrid'
import { getCategoryBySlug, getCoupons } from '@/lib/queries'
import { SITE_NAME } from '@/lib/utils'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategoryBySlug(params.slug)
  if (!cat) return { title: 'Category Not Found' }
  return {
    title: `Best ${cat.name} Coupons & Deals | ${SITE_NAME}`,
    description: `Find the best ${cat.name.toLowerCase()} coupons and deals. Save on top ${cat.name.toLowerCase()} brands with verified promo codes.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const cat = await getCategoryBySlug(params.slug)
  if (!cat) notFound()

  const coupons = await getCoupons({ categoryId: cat.id, excludeExpired: false })
  const active = coupons.filter((c) => !c.expiry_date || new Date(c.expiry_date) >= new Date())

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: 'Categories' }, { label: cat.name }]} />

      {/* Header */}
      <div className="card p-6 mb-8 flex items-center gap-4">
        {cat.icon && <span className="text-5xl">{cat.icon}</span>}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {cat.name} Coupons & Deals
          </h1>
          {cat.description && <p className="text-gray-500 mt-1">{cat.description}</p>}
          <p className="text-sm text-gray-400 mt-1">{active.length} active offers</p>
        </div>
      </div>

      <CouponGrid coupons={active} emptyMessage={`No active ${cat.name} coupons right now. Check back soon!`} />
    </div>
  )
}
