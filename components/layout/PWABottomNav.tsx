'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, Tag, Grid3X3 } from 'lucide-react'

const TABS = [
  { href: '/',           label: 'Home',       icon: Home },
  { href: '/stores',     label: 'Stores',     icon: Store },
  { href: '/search',     label: 'Deals',      icon: Tag },
  { href: '/categories', label: 'Categories', icon: Grid3X3 },
]

export default function PWABottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch h-16">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative ${
                active ? 'text-[#EA580C]' : 'text-gray-400'
              }`}>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#EA580C] rounded-full" />
              )}
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
