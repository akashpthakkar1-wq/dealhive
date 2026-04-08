'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Tag } from 'lucide-react'
import LiveSearchBar from '@/components/search/LiveSearchBar'

const NAV_LINKS = [
  { href: '/',           label: 'Home' },
  { href: '/stores',     label: 'Stores' },
  { href: '/categories', label: 'Categories' },
  { href: '/search',     label: 'New Deals & Coupons' },
  { href: '/blog',       label: 'Blog' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="container-main">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm group-hover:bg-primary-600 transition-colors">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">
              EndOver<span className="text-primary-500">Pay</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  pathname === l.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* ✅ Live search bar — desktop */}
          <div className="flex-1 max-w-md ml-auto hidden md:block">
            <LiveSearchBar variant="navbar" placeholder="Search stores, coupons, deals..." />
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)}
            className="lg:hidden ml-auto p-2 rounded-lg hover:bg-gray-100">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white pb-4">
          <div className="container-main pt-3">
            {/* ✅ Live search bar — mobile */}
            <div className="mb-3">
              <LiveSearchBar variant="navbar" placeholder="Search..." />
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    pathname === l.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
