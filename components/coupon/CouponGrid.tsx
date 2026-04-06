import CouponCard from './CouponCard'
import type { Coupon } from '@/types'

interface Props {
  coupons: Coupon[]
  compact?: boolean
  emptyMessage?: string
}

export default function CouponGrid({ coupons, compact, emptyMessage = 'No coupons found.' }: Props) {
  if (!coupons.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">🏷️</div>
        <p className="font-semibold text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {coupons.map((c) => (
        <CouponCard key={c.id} coupon={c} compact={compact} />
      ))}
    </div>
  )
}
