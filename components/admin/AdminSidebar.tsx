'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Store, FolderOpen, Tag, FileText,
  Code2, Import, ChevronRight, ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AdminLogoutButton from './AdminLogoutButton'

const navItems = [
  { href: '/admin',            label: 'Dashboard',       icon: LayoutDashboard, exact: true },
  { href: '/admin/stores',     label: 'Stores',          icon: Store },
  { href: '/admin/categories', label: 'Categories',      icon: FolderOpen },
  { href: '/admin/coupons',    label: 'Coupons & Deals', icon: Tag },
  { href: '/admin/blog',       label: 'Blog Posts',      icon: FileText },
  { href: '/admin/scripts',    label: 'Script Manager',  icon: Code2 },
  { href: '/admin/import',     label: 'Import / Export', icon: Import },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
            <Tag className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-gray-900 text-base leading-tight">EndOverPay</div>
            <div className="text-xs text-gray-400 font-semibold">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? path === item.href : path.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group',
                active
                  ? 'bg-orange-50 text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600')} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-orange-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — Back to site + Logout */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-orange-600 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Back to Website
        </Link>
        <AdminLogoutButton />
      </div>
    </aside>
  )
}
