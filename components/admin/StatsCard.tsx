import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red'
  trend?: { value: number; label: string }
}

const colors = {
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  blue:   'bg-blue-50 text-blue-600 border-blue-100',
  green:  'bg-green-50 text-green-600 border-green-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  red:    'bg-red-50 text-red-600 border-red-100',
}

export default function StatsCard({ title, value, subtitle, icon, color = 'orange', trend }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0', colors[color])}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{title}</div>
        <div className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
        {trend && (
          <div className={cn('text-xs font-semibold mt-1', trend.value >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
    </div>
  )
}
