import StoreCard from './StoreCard'
import type { Store } from '@/types'

interface Props { stores: Store[] }

export default function StoreGrid({ stores }: Props) {
  if (!stores.length) {
    return <p className="text-gray-400 text-center py-10">No stores found.</p>
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {stores.map((s) => <StoreCard key={s.id} store={s} />)}
    </div>
  )
}
