'use client'
import { useState, useEffect } from 'react'
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
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Shadow-on-scroll: lifts the bar off the page once you scroll down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}>

      {/* Accent strip — Option C signature */}
      <div className="h-[3px] w-full" style={{ backgroundColor: '#EA580C' }} />

      <div className="container-main">
        <div className="flex items-center gap-3 h-16">

          {/* Logo — larger */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo.svg" alt="EndOverPay" className="h-12 w-auto" width="180" height="48" fetchPriority="high" />
          </Link>

          {/* Desktop nav — underline-on-active (tab style) */}
          <nav className="hidden lg:flex items-stretch gap-1 ml-4 h-16">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href
              return (
                <Link key={l.href} href={l.href} prefetch={true}
                  className={`relative flex items-center px-3 text-sm transition-colors duration-200 whitespace-nowrap border-b-[3px] ${
                    active
                      ? 'text-[#EA580C] font-bold border-[#EA580C]'
                      : 'text-gray-700 font-medium border-transparent hover:text-[#EA580C] hover:border-orange-200'
                  }`}>
                  {l.label}
                </Link>
              )
            })}
          </nav>

          {/* Search bar — desktop */}
          <div className="flex-1 max-w-sm ml-auto hidden md:block">
            <SearchBar compact />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden ml-auto p-2 rounded-lg transition-colors hover:bg-orange-50" aria-label="Open menu"
            style={{ color: '#EA580C' }}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-200 pb-3 bg-white">
          <div className="container-main pt-3">

            {/* Mobile search */}
            <div className="mb-3">
              <SearchBar />
            </div>

            {/* Mobile nav links */}
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((l) => {
                const active = pathname === l.href
                return (
                  <Link key={l.href} href={l.href} prefetch={true}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      active
                        ? 'text-[#EA580C] font-semibold bg-orange-50/60'
                        : 'text-gray-700 font-medium hover:bg-gray-50 hover:text-[#EA580C]'
                    }`}>
                    {l.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
