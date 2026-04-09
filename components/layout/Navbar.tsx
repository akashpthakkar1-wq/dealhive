'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/',           label: 'Home' },
  { href: '/stores',     label: 'Stores' },
  { href: '/categories', label: 'Categories' },
  { href: '/search',     label: 'New Deals & Coupons' },
  { href: '/blog',       label: 'Blog' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 shadow-sm"
      style={{ backgroundColor: '#F5CE4A' }}>
      <div className="container-main">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.svg" alt="EndOverPay" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  pathname === l.href
                    ? 'bg-black/10 text-[#2A1250]'
                    : 'text-[#3D186B] hover:text-black hover:bg-black/10'
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search bar — desktop */}
          <div className="flex-1 max-w-md ml-auto hidden md:block">
            <form action="/search" method="GET">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  name="q"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stores, coupons, deals..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-black/15 rounded-xl bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3D186B]/30 focus:border-[#3D186B]/40 transition-all"
                />
              </div>
            </form>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden ml-auto p-2 rounded-lg transition-colors hover:bg-black/10"
            style={{ color: '#3D186B' }}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-black/10 pb-4"
          style={{ backgroundColor: '#F5CE4A' }}>
          <div className="container-main pt-3">

            {/* Mobile search */}
            <form action="/search" method="GET" className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  name="q"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-black/15 rounded-xl bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3D186B]/30 transition-all"
                />
              </div>
            </form>

            {/* Mobile nav links */}
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    pathname === l.href
                      ? 'bg-black/10 text-[#2A1250]'
                      : 'text-[#3D186B] hover:bg-black/10 hover:text-black'
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
