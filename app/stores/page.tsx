import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Tag } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SITE_NAME } from '@/lib/utils'
import StoresSearchBar from '@/components/stores/StoresSearchBar'

export const metadata: Metadata = {
  title: `All Stores – Find Coupons & Deals`,
  description: `Browse all stores on ${SITE_NAME}. Find verified coupon codes and deals from hundreds of top online stores in India.`,
}

export const revalidate = 3600

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('')

export default async function StoresPage() {
  const supabase = createServerSupabaseClient()
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, slug, logo, category, description')
    .order('name')

  const allStores = stores || []

  // Group alphabetically
  const grouped: Record<string, typeof allStores> = {}
  allStores.forEach((s) => {
    const first = s.name[0].toUpperCase()
    const key = /[A-Z]/.test(first) ? first : '#'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  })

  const availableLetters = new Set(Object.keys(grouped))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">All Stores</h1>
          <p className="text-white/80 text-lg mb-6">
            Browse {allStores.length}+ stores and find the best deals
          </p>
          {/* ✅ Live search with dropdown — same as home page + navbar */}
          <div className="max-w-md mx-auto">
            <StoresSearchBar />
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Alphabet quick nav */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 sticky top-[73px] z-20">
          <div className="flex flex-wrap gap-1 justify-center">
            {ALPHABET.map((letter) => (
              availableLetters.has(letter) ? (
                <a key={letter} href={`#letter-${letter}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold text-primary-600 hover:bg-primary-500 hover:text-white bg-primary-50 border border-primary-200 transition-all">
                  {letter}
                </a>
              ) : (
                <span key={letter}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-gray-300 bg-gray-50 cursor-default">
                  {letter}
                </span>
              )
            ))}
          </div>
        </div>

        {/* Stores grouped by letter */}
        <div className="space-y-8">
          {ALPHABET.filter((l) => grouped[l]).map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-40">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500 text-white font-extrabold text-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  {letter}
                </div>
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">
                  {grouped[letter].length} stores
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {grouped[letter].map((store) => (
                  <Link key={store.id} href={`/store/${store.slug}`}
                    className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-2.5 hover:border-primary-300 hover:shadow-md hover:bg-primary-50 transition-all group text-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center flex-shrink-0">
                      {store.logo
                        ? <img src={store.logo} alt={`${store.name} logo`} className="w-full h-full object-contain" />
                        : <Tag className="w-7 h-7 text-primary-300" />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                        {store.name}
                      </div>
                      {store.category && (
                        <div className="text-xs text-gray-400 mt-0.5">{store.category}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {allStores.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold">No stores yet</p>
            <p className="text-sm mt-1">Add stores from the admin panel</p>
          </div>
        )}
      </div>
    </div>
  )
}
