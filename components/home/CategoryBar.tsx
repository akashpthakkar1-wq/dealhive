import Link from 'next/link'
import type { Category } from '@/types'

interface Props { categories: Category[] }

export default function CategoryBar({ categories }: Props) {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container-main py-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Link href="/search"
            className="flex-shrink-0 px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors">
            All Deals
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all">
              {c.icon && <span>{c.icon}</span>}
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
