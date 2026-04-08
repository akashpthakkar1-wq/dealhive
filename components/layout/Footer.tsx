'use client'
import Link from 'next/link'
import { Mail, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  const categories = ['Fashion', 'Electronics', 'Food', 'Travel', 'Beauty', 'Home', 'Gaming', 'Health']
  const stores = ['SHEIN', 'Myntra', 'Amazon', 'Flipkart', 'Swiggy', 'Nykaa', 'Zomato', 'MakeMyTrip']
  const company = ['About Us', 'Blog', 'Contact', 'Privacy Policy', 'Terms of Service', 'Disclaimer', 'Submit a Coupon']

  return (
    <footer style={{ backgroundColor: '#3D186B' }} className="mt-8">
      <div className="container-main pt-10 pb-6">

        {/* Main 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-3">
              <img src="/logo.svg" alt="EndOverPay" className="h-9 w-auto" />
            </Link>
            <p className="text-xs leading-5 mb-4 max-w-[200px]" style={{ color: '#D1C4E9' }}>
              India&apos;s most trusted coupon &amp; deal platform. Verified codes, real savings.
            </p>
            <div className="flex gap-2">
              {[Twitter, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#"
                  className="footer-social-icon w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-2.5 text-xs uppercase tracking-wide">
              Categories
            </h4>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c}>
                  <Link href={`/category/${c.toLowerCase()}`} className="footer-link text-xs leading-5 transition-colors duration-200 block">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Stores */}
          <div>
            <h4 className="font-semibold text-white mb-2.5 text-xs uppercase tracking-wide">
              Popular Stores
            </h4>
            <ul className="space-y-2">
              {stores.map((s) => (
                <li key={s}>
                  <Link href={`/store/${s.toLowerCase()}`} className="footer-link text-xs leading-5 transition-colors duration-200 block">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-2.5 text-xs uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-2">
              {company.map((l) => (
                <li key={l}>
                  <Link href="#" className="footer-link text-xs leading-5 transition-colors duration-200 block">
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
          <p className="text-xs" style={{ color: '#D1C4E9' }}>
            © {new Date().getFullYear()} EndOverPay. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#D1C4E9' }}>
            Some links may be affiliate links. Prices &amp; offers subject to change.
          </p>
        </div>

      </div>

      {/* Inline CSS for custom hover colors */}
      <style jsx global>{`
        .footer-link {
          color: #D1C4E9;
        }
        .footer-link:hover {
          color: #F5CE4A;
          text-decoration: underline;
        }
        .footer-social-icon {
          background-color: rgba(255,255,255,0.1);
          color: #D1C4E9;
        }
        .footer-social-icon:hover {
          background-color: rgba(255,255,255,0.15);
          color: #F5CE4A;
          transform: scale(1.05);
        }
      `}</style>
    </footer>
  )
}
