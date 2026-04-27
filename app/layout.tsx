import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
const Toaster = dynamic(() => import('react-hot-toast').then(m => ({ default: m.Toaster })), { ssr: false })
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GlobalPopupHandler from '@/components/layout/GlobalPopupHandler'
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt'
import { SITE_NAME, SITE_URL } from '@/lib/utils'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
  variable: '--font-jakarta',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  title: {
    default: `${SITE_NAME} – Best Coupon Codes, Promo Codes & Voucher Codes 2026`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Find verified coupon codes, promo codes and voucher codes from 500+ top stores worldwide. Save on fashion, electronics, food, travel and more with ${SITE_NAME}.`,
  verification: {
    google: 'eN_E2NyrvrNTuKG5Zkd7V93ZdD_M_Vr3rAN0cPcV1eA',
  },
  keywords: 'coupons, promo codes, voucher codes, discount codes, deals, SHEIN, Amazon, Myntra, Flipkart, Swiggy',
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
    title: `${SITE_NAME} – Best Coupon Codes, Promo Codes & Voucher Codes 2026`,
    description: `Find verified coupon codes from 500+ top stores worldwide.`,
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
    description: 'Find verified coupon codes from 500+ top stores worldwide.',
    images: [`${SITE_URL}/og-default.jpg`],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.className} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://tgotmpnebrqqfbxucdax.supabase.co" />
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="EndOverPay" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EndOverPay" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#EA580C" />
        <meta name="msapplication-TileColor" content="#EA580C" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="dns-prefetch" href="https://tgotmpnebrqqfbxucdax.supabase.co" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.svg`,
          description: `Your trusted coupon and deals platform. Find verified coupon codes from top stores worldwide.`,
          sameAs: ['https://twitter.com/endoverpay', 'https://instagram.com/endoverpay'],
        }) }} />
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K8ESRFKELG"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-K8ESRFKELG', { send_page_view: true });
        `}</Script>
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
        <Suspense fallback={null}>
          <GlobalPopupHandler />
        </Suspense>
        <PWAInstallPrompt />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
