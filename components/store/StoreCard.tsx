import Link from 'next/link'
import Image from 'next/image'
import { Tag } from 'lucide-react'
import type { Store } from '@/types'

interface Props { store: Store; couponCount?: number }

export default function StoreCard({ store, couponCount }: Props) {
  return (
    <Link href={`/store/${store.slug}`}
      className="card p-4 flex flex-col items-center text-center gap-3 hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
        {store.logo ? (
          <Image src={store.logo} alt={store.name} width={56} height={56} className="object-contain" />
        ) : (
          <div className="w-full h-full bg-orange-100 flex items-center justify-center">
            <Tag className="w-6 h-6 text-orange-500" />
          </div>
        )}
      </div>
      <div>
        <div className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">{store.name}</div>
        {couponCount !== undefined && (
          <div className="text-xs text-gray-400 mt-0.5">{couponCount} offers</div>
        )}
        {store.category && (
          <div className="text-xs text-orange-500 font-semibold mt-1">{store.category}</div>
        )}
      </div>
    </Link>
  )
}
