'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Store, Tag, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Coupon, Store as StoreType } from '@/types'
import { createClient } from '@/lib/supabase'

interface Props { compact?: boolean }

export default function SearchBar({ compact }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ coupons: Coupon[]; stores: StoreType[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const [couponsRes, storesRes] = await Promise.all([
        supabase
          .from('coupons')
          .select('*, store:stores(name,slug,logo)')
          .or(`title.ilike.%${q}%,description.ilike.%${q}%,code.ilike.%${q}%`)
          .limit(5),
        supabase
          .from('stores')
          .select('*')
          .ilike('name', `%${q}%`)
          .limit(3),
      ])
      setResults({ coupons: couponsRes.data || [], stores: storesRes.data || [] })
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const timer = setTimeout(() => { if (query) search(query) }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setFocused(false)
    }
  }

  const hasResults = results && (results.coupons.length > 0 || results.stores.length > 0)
  const showDropdown = focused && query.length >= 2

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={compact ? 'Search deals…' : 'Search stores, coupons, deals…'}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults(null) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Live Search Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden animate-fade-in">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Searching…
            </div>
          )}

          {!loading && !hasResults && query.length >= 2 && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && hasResults && (
            <>
              {results!.stores.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 flex items-center gap-1.5">
                    <Store className="w-3 h-3" /> Stores
                  </div>
                  {results!.stores.map((store) => (
                    <Link key={store.id} href={`/store/${store.slug}`}
                      onClick={() => setFocused(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors">
                      {store.logo && (
                        <div className="w-7 h-7 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                          <Image src={store.logo} alt={store.name} width={28} height={28} className="object-contain" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{store.name}</div>
                        <div className="text-xs text-gray-500">{store.category}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results!.coupons.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Coupons
                  </div>
                  {results!.coupons.map((c) => (
                    <Link key={c.id} href={`/coupon/${c.slug}`}
                      onClick={() => setFocused(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{c.title}</div>
                        <div className="text-xs text-gray-500">{(c.store as any)?.name}</div>
                      </div>
                      {c.discount && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                          {c.discount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              <div className="px-4 py-2.5 border-t border-gray-100">
                <button onClick={handleSubmit as any}
                  className="w-full text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1.5 justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                  See all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
