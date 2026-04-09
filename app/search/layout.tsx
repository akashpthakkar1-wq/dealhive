import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Deals & Coupons – Latest Verified Offers',
  description: 'Browse the latest verified coupon codes and deals from top stores in India. Updated daily.',
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
