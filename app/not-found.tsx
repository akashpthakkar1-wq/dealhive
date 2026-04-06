import Link from 'next/link'
import { Search, Home, Tag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-main py-24 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
        <span className="text-5xl">🏷️</span>
      </div>
      <h1 className="text-6xl font-extrabold text-gray-900 mb-3">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-3">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Looks like this deal has expired or the page doesn&apos;t exist. Let&apos;s find you something better!
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
        <Link href="/search" className="btn-secondary">
          <Search className="w-4 h-4" /> Browse All Deals
        </Link>
      </div>
    </div>
  )
}
