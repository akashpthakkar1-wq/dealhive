import { Tag, Store, FolderOpen, MousePointerClick, TrendingUp, Plus, FileText } from 'lucide-react'
import Link from 'next/link'
import StatsCard from '@/components/admin/StatsCard'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { formatDate } from '@/lib/utils'

async function getDashboardData() {
  const supabase = createAdminSupabaseClient()
  const [coupons, stores, cats, clicks, recent, blog] = await Promise.all([
    supabase.from('coupons').select('id', { count: 'exact', head: true }),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('clicks').select('id', { count: 'exact', head: true }),
    supabase.from('coupons').select('id,title,discount,created_at,store:stores(name)').order('created_at', { ascending: false }).limit(8),
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
  ])
  return {
    couponCount: coupons.count || 0,
    storeCount: stores.count || 0,
    catCount: cats.count || 0,
    clickCount: clicks.count || 0,
    blogCount: blog.count || 0,
    recent: recent.data || [],
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Coupons" value={data.couponCount} icon={<Tag className="w-5 h-5" />} color="orange" subtitle="Active deals" />
        <StatsCard title="Total Stores" value={data.storeCount} icon={<Store className="w-5 h-5" />} color="blue" />
        <StatsCard title="Categories" value={data.catCount} icon={<FolderOpen className="w-5 h-5" />} color="purple" />
        <StatsCard title="Total Clicks" value={data.clickCount.toLocaleString()} icon={<MousePointerClick className="w-5 h-5" />} color="green" subtitle="All time" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/coupons', label: 'Add Coupon', icon: '🏷️', color: 'bg-orange-500' },
          { href: '/admin/stores',  label: 'Add Store',  icon: '🏪', color: 'bg-blue-500' },
          { href: '/admin/blog',    label: 'New Post',   icon: '✍️', color: 'bg-purple-500' },
          { href: '/admin/import',  label: 'Bulk Import', icon: '📥', color: 'bg-green-500' },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow group">
            <div className={`w-9 h-9 ${a.color} rounded-lg flex items-center justify-center text-lg flex-shrink-0`}>
              {a.icon}
            </div>
            <span className="font-bold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent coupons */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recently Added Coupons</h3>
          <Link href="/admin/coupons" className="text-sm font-semibold text-orange-600 hover:text-orange-700">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Title', 'Store', 'Discount', 'Added', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recent.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-semibold text-gray-800 max-w-xs truncate">{c.title}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.store?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full border border-orange-100">
                      {c.discount || 'DEAL'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{formatDate(c.created_at)}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/coupons?edit=${c.id}`} className="text-xs font-semibold text-orange-600 hover:text-orange-700">Edit</Link>
                  </td>
                </tr>
              ))}
              {data.recent.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">No coupons yet. <Link href="/admin/coupons" className="text-orange-600 font-semibold">Add your first →</Link></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
