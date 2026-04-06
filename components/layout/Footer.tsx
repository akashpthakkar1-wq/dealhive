import Link from 'next/link'
import { Tag, Mail, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  const categories = ['Fashion', 'Electronics', 'Food', 'Travel', 'Beauty', 'Home', 'Gaming', 'Health']
  const stores = ['SHEIN', 'Myntra', 'Amazon', 'Flipkart', 'Swiggy', 'Nykaa', 'Zomato', 'MakeMyTrip']

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container-main py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white">
                Deal<span className="text-orange-400">Hive</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              India&apos;s most trusted coupon & deal platform. Verified codes, real savings.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c}>
                  <Link href={`/category/${c.toLowerCase()}`}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Stores */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Popular Stores</h4>
            <ul className="space-y-2">
              {stores.map((s) => (
                <li key={s}>
                  <Link href={`/store/${s.toLowerCase()}`}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Blog', 'Contact', 'Privacy Policy', 'Terms of Service', 'Disclaimer', 'Submit a Coupon'].map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} DealHive. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Some links may be affiliate links. Prices & offers subject to change.
          </p>
        </div>
      </div>
    </footer>
  )
}
