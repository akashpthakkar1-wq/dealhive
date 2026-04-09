import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata: Metadata = { title: 'Admin Panel | EndOverPay' }

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'endoverpay2025'
const COOKIE_NAME    = 'admin_auth'
const COOKIE_VALUE   = 'authenticated'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check auth cookie — if not authenticated, redirect to login
  const cookieStore = cookies()
  const auth = cookieStore.get(COOKIE_NAME)

  if (auth?.value !== COOKIE_VALUE) {
    redirect('/admin/login')
  }

  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
