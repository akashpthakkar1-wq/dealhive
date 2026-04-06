import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Search } from 'lucide-react'
import SearchBar from '@/components/layout/SearchBar'
import CouponGrid from '@/components/coupon/CouponGrid'
import StoreGrid from '@/components/store/StoreGrid'
import Pagination from '@/components/ui/Pagination'
import { searchCoupons, getCoupons, getCategories } from '@/lib/queries'
import { SITE_NAME } from '@/lib/utils'

interface Props { searchParams: { q?: string; page?: string; sort?: string; category?: string } }

export const metadata: Metadata = {
  title: `Search Coupons & Deals | ${SITE_NAME}`,
  description: 'Search thousands of verified coupon codes and deals from top Indian stores.',
}

const PAGE_SIZE = 24

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')
  const sort = searchParams.sort || 'newest'

  const categories = await getCategories()
  let coupons: any[] = []
  let stores: any[] = []

  if (query) {
    const res = await searchCoupons(query)
    coupons = res.coupons
    stores = res.stores
  } else {
    const allCoupons = await getCoupons({
      featured: sort === 'featured' || undefined,
      trending: sort === 'trending' || undefined,
      excludeExpired: sort !== 'expired',
    })
    // Sort
    if (sort === 'newest') allCoupons.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sort === 'popular') allCoupons.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    coupons = allCoupons
  }

  const totalPages = Math.ceil(coupons.length / PAGE_SIZE)
  const paginated = coupons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="container-main py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
          {query ? (
            <>Results for <span className="text-orange-500">&ldquo;{query}&rdquo;</span></>
          ) : 'All Coupons & Deals'}
        </h1>
        <p className="text-gray-500 text-sm">{coupons.length} offers found</p>
      </div>

      {/* Search bar */}
      <div className="mb-6 max-w-xl">
        <SearchBar />
      </div>

      {/* Sort / Filter bar */}
      {!query && (
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { val: 'newest', label: 'Newest First' },
            { val: 'trending', label: '🔥 Trending' },
            { val: 'popular', label: '⭐ Most Used' },
            { val: 'featured', label: '✨ Featured' },
          ].map((s) => (
            <a key={s.val} href={`/search?sort=${s.val}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${sort === s.val ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-600'}`}>
              {s.label}
            </a>
          ))}
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <a key={c.id} href={`/category/${c.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all">
            {c.icon} {c.name}
          </a>
        ))}
      </div>

      {/* Store results (only when searching) */}
      {query && stores.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🏪 Stores ({stores.length})
          </h2>
          <StoreGrid stores={stores} />
        </div>
      )}

      {/* Coupon results */}
      {query && coupons.length > 0 && (
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          🏷️ Coupons ({coupons.length})
        </h2>
      )}

      {paginated.length === 0 && query ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-500 mb-2">No results for &ldquo;{query}&rdquo;</h3>
          <p className="text-gray-400 mb-6">Try a different search term or browse categories</p>
          <a href="/search" className="btn-primary">Browse All Deals</a>
        </div>
      ) : (
        <>
          <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <CouponGrid coupons={paginated} />
          </Suspense>
          <Pagination currentPage={page} totalPages={totalPages} basePath="/search" />
        </>
      )}
    </div>
  )
}
