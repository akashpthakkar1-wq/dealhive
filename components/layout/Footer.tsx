import Link from 'next/link'
import { Mail, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  const categories = ['Fashion', 'Electronics', 'Food', 'Travel', 'Beauty', 'Home', 'Gaming', 'Health']
  const stores = ['SHEIN', 'Myntra', 'Amazon', 'Flipkart', 'Swiggy', 'Nykaa', 'Zomato', 'MakeMyTrip']
  const company = ['About Us', 'Blog', 'Contact', 'Privacy Policy', 'Terms of Service', 'Disclaimer', 'Submit a Coupon']

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-10">
      <div className="container-main pt-10 pb-6">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-3">
              <img src="/logo.svg" alt="EndOverPay" className="h-10 w-auto" />
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed mb-3 max-w-[200px]">
              India&apos;s most trusted coupon &amp; deal platform. Verified codes, real savings.
            </p>
            <div className="flex gap-2">
              {[Twitter, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors text-gray-500">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2.5 text-xs uppercase tracking-wider">Categories</h4>
            <ul className="space-y-1.5">
              {categories.map((c) => (
                <li key={c}>
                  <Link href={`/category/${c.toLowerCase()}`}
                    className="text-xs text-gray-500 hover:text-primary-600 transition-colors leading-tight block">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Stores */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2.5 text-xs uppercase tracking-wider">Popular Stores</h4>
            <ul className="space-y-1.5">
              {stores.map((s) => (
                <li key={s}>
                  <Link href={`/store/${s.toLowerCase()}`}
                    className="text-xs text-gray-500 hover:text-primary-600 transition-colors leading-tight block">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2.5 text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-1.5">
              {company.map((l) => (
                <li key={l}>
                  <Link href="#"
                    className="text-xs text-gray-500 hover:text-primary-600 transition-colors leading-tight block">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider + Copyright */}
        <div className="border-t border-gray-200 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} EndOverPay. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Some links may be affiliate links. Prices &amp; offers subject to change.
          </p>
        </div>

      </div>
    </footer>
  )
}
