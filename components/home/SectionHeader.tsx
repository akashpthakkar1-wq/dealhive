import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  viewAllHref?: string
  viewAllLabel?: string
  icon?: React.ReactNode
}

export default function SectionHeader({ title, subtitle, viewAllHref, viewAllLabel = 'View All', icon }: Props) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h2 className="section-title">{title}</h2>
        </div>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref}
          className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors flex-shrink-0">
          {viewAllLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
