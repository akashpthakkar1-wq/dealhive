'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import SearchBar from './SearchBar'

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
    <header
      className="sticky top-0 z-50 border-b border-black/10 shadow-sm"
      style={{ backgroundColor: '#FFFFFF' }}>
      <div className="container-main">
        <div className="flex items-center gap-3 h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo.svg" alt="EndOverPay" className="h-11 w-auto" width="160" height="44" fetchPriority="low" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-3">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} prefetch={true}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  pathname === l.href
                    ? 'bg-black/10 text-[#2A1250] font-semibold'
                    : 'text-[#EA580C] hover:text-black hover:bg-black/10'
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search bar — desktop (uses SearchBar with dropdown) */}
          <div className="flex-1 max-w-sm ml-auto hidden md:block">
            <SearchBar compact />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden ml-auto p-2 rounded-lg transition-colors hover:bg-black/10" aria-label="Open menu"
            style={{ color: '#EA580C' }}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="lg:hidden border-t border-black/10 pb-3"
          style={{ backgroundColor: '#FFFFFF' }}>
          <div className="container-main pt-3">

            {/* Mobile search — also uses SearchBar with dropdown */}
            <div className="mb-3">
              <SearchBar />
            </div>

            {/* Mobile nav links */}
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} prefetch={true}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === l.href
                      ? 'bg-black/10 text-[#2A1250] font-semibold'
                      : 'text-[#EA580C] hover:bg-black/10 hover:text-black'
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
