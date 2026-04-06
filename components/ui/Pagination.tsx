'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { currentPage: number; totalPages: number; basePath: string }

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  if (totalPages <= 1) return null

  const go = (page: number) => {
    const p = new URLSearchParams(params.toString())
    p.set('page', String(page))
    router.push(`${basePath}?${p.toString()}`)
  }

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (currentPage <= 4) return i + 1
    if (currentPage >= totalPages - 3) return totalPages - 6 + i
    return currentPage - 3 + i
  })

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button onClick={() => go(currentPage - 1)} disabled={currentPage === 1}
        className={cn('w-9 h-9 rounded-lg flex items-center justify-center border text-sm font-semibold transition-all',
          currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600')}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => go(p)}
          className={cn('w-9 h-9 rounded-lg flex items-center justify-center border text-sm font-bold transition-all',
            p === currentPage ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600')}>
          {p}
        </button>
      ))}
      <button onClick={() => go(currentPage + 1)} disabled={currentPage === totalPages}
        className={cn('w-9 h-9 rounded-lg flex items-center justify-center border text-sm font-semibold transition-all',
          currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600')}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
