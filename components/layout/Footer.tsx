'use client'
import Link from 'next/link'
import { Mail, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  const categories = ['Fashion', 'Electronics', 'Food', 'Travel', 'Beauty', 'Home', 'Gaming', 'Health']
  const stores = ['SHEIN', 'Myntra', 'Amazon', 'Flipkart', 'Swiggy', 'Nykaa', 'Zomato', 'MakeMyTrip']
  const company = [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'Submit a Coupon', href: '/submit-coupon' },
  ]

  return (
    <footer style={{ backgroundColor: '#1C1917' }} className="mt-8">
      <div className="container-main pt-10 pb-6">

        {/* Main 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-3">
              <img src="/logo-dark.svg" alt="EndOverPay" className="h-9 w-auto" width="160" height="36" />
            </Link>
            <p className="text-sm leading-5 mb-4 max-w-[200px]" style={{ color: '#D6D3D1' }}>
              Your trusted coupon &amp; deal platform worldwide. Verified codes, real savings.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Mail, label: 'Email' },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="footer-social w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-2.5 text-xs uppercase tracking-wide" style={{ color: '#EA580C' }}>
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c}>
                  <Link href={`/category/${c.toLowerCase()}`} className="footer-link text-sm leading-5 block transition-all duration-200">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Stores */}
          <div>
            <h3 className="font-semibold mb-2.5 text-xs uppercase tracking-wide" style={{ color: '#EA580C' }}>
              Popular Stores
            </h3>
            <ul className="space-y-2">
              {stores.map((s) => (
                <li key={s}>
                  <Link href={`/store/${s.toLowerCase()}`} className="footer-link text-sm leading-5 block transition-all duration-200">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-2.5 text-xs uppercase tracking-wide" style={{ color: '#EA580C' }}>
              Company
            </h3>
            <ul className="space-y-2">
              {company.map((l) => (
                <li key={l}>
                  <Link href="#" className="footer-link text-sm leading-5 block transition-all duration-200">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

        {/* Bottom bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            © {new Date().getFullYear()} EndOverPay. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            Some links may be affiliate links. Prices &amp; offers subject to change.
          </p>
        </div>

      </div>

      <style jsx global>{`
        .footer-link {
          color: #FED7AA;
        }
        .footer-link:hover {
          color: #EA580C;
          text-decoration: underline;
        }
        .footer-social {
          background-color: rgba(0,0,0,0.1);
          color: #FED7AA;
        }
        .footer-social:hover {
          background-color: rgba(255,255,255,0.3);
          color: #000000;
          transform: scale(1.05);
        }
      `}</style>
    </footer>
  )
}
