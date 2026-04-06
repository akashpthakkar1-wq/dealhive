import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSiteScripts } from '@/lib/queries'
import { SITE_NAME, SITE_URL } from '@/lib/utils'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} – Best Coupons & Deals in India`, template: `%s | ${SITE_NAME}` },
  description: 'Find the best verified coupon codes, discount deals and offers from top stores in India. Save money every day with DealHive.',
  keywords: 'coupons, deals, promo codes, discount codes, India, SHEIN, Amazon, Myntra, Flipkart',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Best Coupons & Deals in India`,
    description: 'Find verified coupon codes and deals from top stores.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [headerScripts, footerScripts] = await Promise.all([
    getSiteScripts('header'),
    getSiteScripts('footer'),
  ])

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {headerScripts.map((s) => (
          <div key={s.id} dangerouslySetInnerHTML={{ __html: s.content }} />
        ))}
      </head>
      <body>
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#1f2937', color: '#fff' } }} />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        {footerScripts.map((s) => (
          <div key={s.id} dangerouslySetInnerHTML={{ __html: s.content }} />
        ))}
      </body>
    </html>
  )
}
