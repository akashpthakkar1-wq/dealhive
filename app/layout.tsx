import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GlobalPopupHandler from '@/components/layout/GlobalPopupHandler'
import { SITE_NAME, SITE_URL } from '@/lib/utils'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Best Coupons & Deals in India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Find verified coupon codes and deals from top stores in India. Save big with EndOverPay!',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#1f2937',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />

        {/*
          ✅ GlobalPopupHandler — renders on EVERY page.
          When any page URL contains ?popup=COUPON_ID it fetches that
          coupon and shows the modal automatically.
          Wrapped in Suspense because it uses useSearchParams().
        */}
        <Suspense fallback={null}>
          <GlobalPopupHandler />
        </Suspense>
      </body>
    </html>
  )
}
