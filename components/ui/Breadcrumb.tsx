import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb { label: string; href?: string }
interface Props { items: Crumb[] }

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-orange-600 transition-colors flex items-center">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-orange-600 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
