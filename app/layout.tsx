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
    default: `${SITE_NAME} – Best Coupon Codes & Promo Codes in India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Find verified coupon codes and promo codes from 500+ top stores in India. Save on fashion, electronics, food, travel and more with ${SITE_NAME}.`,
  keywords: 'coupons, promo codes, deals, discount codes, India, SHEIN, Amazon, Myntra, Flipkart, Swiggy',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Best Coupon Codes & Promo Codes in India`,
    description: `Find verified coupon codes from 500+ top stores in India.`,
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} – Best Coupons & Deals`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@endoverpay',
    title: `${SITE_NAME} – Best Coupon Codes & Promo Codes`,
    description: 'Find verified coupon codes from 500+ top stores in India.',
    images: [`${SITE_URL}/og-default.jpg`],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" crossOrigin="anonymous"
          rel="stylesheet"
        />
        {/* Organization schema — on every page */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.svg`,
          description: `India's most trusted coupon and deals platform. Find verified coupon codes from top stores.`,
          sameAs: ['https://twitter.com/endoverpay', 'https://instagram.com/endoverpay'],
        }) }} />
        {/* WebSite schema with SearchAction — enables Sitelinks Searchbox in Google */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
        }) }} />
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
