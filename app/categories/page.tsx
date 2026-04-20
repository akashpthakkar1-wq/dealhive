import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SITE_NAME } from '@/lib/utils'

export const metadata: Metadata = {
  title: `All Categories`,
  description: `Browse all deal categories on ${SITE_NAME}. Find coupons and deals by category.`,
}

export const revalidate = 3600

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('')

export default async function CategoriesPage() {
  const supabase = createServerSupabaseClient()
  const { data: cats } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description')
    .order('name')

  const allCats = cats || []

  // Group alphabetically
  const grouped: Record<string, typeof allCats> = {}
  allCats.forEach((c) => {
    const first = c.name[0].toUpperCase()
    const key = /[A-Z]/.test(first) ? first : '#'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  })

  const availableLetters = new Set(Object.keys(grouped))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">All Categories</h1>
          <p className="text-white/80 text-lg">Browse deals by your favourite category</p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Alphabet quick nav */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 md:sticky md:top-[73px] md:z-20">
          <div className="flex flex-wrap gap-1 justify-center">
            {ALPHABET.map((letter) => (
              availableLetters.has(letter) ? (
                <a key={letter} href={`#cat-${letter}`}
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

        {/* Categories grouped by letter */}
        <div className="space-y-8">
          {ALPHABET.filter((l) => grouped[l]).map((letter) => (
            <div key={letter} id={`cat-${letter}`} className="scroll-mt-48">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500 text-white font-extrabold text-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  {letter}
                </div>
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{grouped[letter].length} categories</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {grouped[letter].map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`}
                    className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center gap-2 hover:border-primary-300 hover:bg-primary-50 transition-colors group text-center">
                    <div className="text-4xl">{cat.icon || '🏷️'}</div>
                    <div className="font-bold text-gray-900 text-sm group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">{cat.name}</div>
                    {cat.description && (
                      <div className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{cat.description}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {allCats.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-lg font-semibold">No categories yet</p>
            <p className="text-sm mt-1">Add categories from the admin panel</p>
          </div>
        )}
      </div>
    </div>
  )
}
