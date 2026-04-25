'use client'

import { useState, useMemo } from 'react'
import CouponCard from '@/components/coupon/CouponCard'

const FILTER_TABS = [
  { id: 'all',      label: 'All Offers' },
  { id: 'code',     label: '🏷️ Codes' },
  { id: 'deal',     label: '🔥 Deals' },
  { id: 'free',     label: '🚚 Free Ship' },
  { id: 'verified', label: '✅ Verified' },
  { id: 'featured', label: '⭐ Featured' },
]

interface Props {
  coupons: any[]
  storeName: string
}

export default function StoreFilterTabs({ coupons, storeName }: Props) {
  const [filter, setFilter] = useState('all')

  const { filteredCoupons, counts } = useMemo(() => {
    const active = coupons.filter(c => !c.expiry_date || new Date(c.expiry_date) >= new Date())
    const code = active.filter(c => c.type === 'code')
    const deal = active.filter(c => c.type === 'deal')
    const free = active.filter(c => (c.title + (c.description || '')).toLowerCase().includes('free ship'))
    const verified = active.filter(c => c.is_verified)
    const featured = active.filter(c => c.is_featured)

    const counts: Record<string, number> = {
      all: active.length, code: code.length, deal: deal.length,
      free: free.length, verified: verified.length, featured: featured.length,
    }

    const filtered =
      filter === 'code' ? code : filter === 'deal' ? deal :
      filter === 'free' ? free : filter === 'verified' ? verified :
      filter === 'featured' ? featured : active

    return { filteredCoupons: filtered, counts }
  }, [coupons, filter])

  const activeTab = FILTER_TABS.find(t => t.id === filter)

  return (
    <>
      {/* Filter tabs */}
      <div className="relative mt-4">
        <div className="flex overflow-x-auto flex-nowrap gap-2 px-1 pb-2 md:pb-1 scroll-smooth scroll-px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {FILTER_TABS.map((tab) => (
            <button key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 min-h-[40px] rounded-full text-sm font-semibold border whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>
        <div className="md:hidden pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-50 to-transparent" />
      </div>

      {/* Heading */}
      <div>
        <h2 className="font-bold text-gray-900 text-lg mb-4">
          {filter === 'all'
            ? `All ${counts.all} Active ${storeName} Coupons & Deals`
            : `${filteredCoupons.length} ${activeTab?.label} for ${storeName}`}
        </h2>

        {filteredCoupons.length > 0 ? (
          <div className="space-y-4">
            {filteredCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No {activeTab?.label} found</p>
            <button onClick={() => setFilter('all')} className="mt-2 text-primary-500 hover:underline text-sm">
              View all offers
            </button>
          </div>
        )}
      </div>
    </>
  )
}
