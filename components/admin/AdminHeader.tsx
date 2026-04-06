'use client'
import { usePathname } from 'next/navigation'
import { Bell, LogOut } from 'lucide-react'

const titles: Record<string, string> = {
  '/admin':            'Dashboard',
  '/admin/stores':     'Manage Stores',
  '/admin/categories': 'Manage Categories',
  '/admin/coupons':    'Coupons & Deals',
  '/admin/blog':       'Blog Posts',
  '/admin/scripts':    'Script Manager',
  '/admin/import':     'Import / Export',
}

export default function AdminHeader() {
  const path = usePathname()
  const title = titles[path] || 'Admin'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-extrabold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400">DealHive Admin · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
          A
        </div>
      </div>
    </header>
  )
}
