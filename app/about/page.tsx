import { Metadata } from 'next'
import Link from 'next/link'
const SITE_NAME = 'EndOverPay'
export const metadata: Metadata = {
  title: `About Us | ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME} — your trusted source for verified coupon codes, promo codes and deals worldwide.`,
}
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl font-extrabold mb-2">About EndOverPay</h1>
          <p className="text-white/80">Your trusted coupon platform worldwide</p>
        </div>
      </div>
      <div className="container-main py-12 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed">EndOverPay is a global coupon and deals platform dedicated to helping shoppers save money on their everyday purchases. We manually verify every coupon code, promo code and deal before publishing to ensure you never waste time on expired or invalid codes.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">Our mission is simple — stop overpaying. We believe everyone deserves access to the best deals and discounts from top stores worldwide. From fashion and electronics to food delivery and travel, we cover hundreds of stores across every category.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What We Offer</h2>
            <ul className="text-gray-600 leading-relaxed space-y-2">
              <li>✅ Manually verified coupon codes updated daily</li>
              <li>✅ Promo codes, voucher codes and discount codes from 500+ stores</li>
              <li>✅ Exclusive deals and offers not available elsewhere</li>
              <li>✅ Free to use — no signup required</li>
              <li>✅ Coverage across 20+ categories worldwide</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">Have questions or want to submit a coupon? <Link href="/contact" className="text-primary-500 hover:underline font-semibold">Contact us here</Link> or <Link href="/submit-coupon" className="text-primary-500 hover:underline font-semibold">submit a coupon</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
