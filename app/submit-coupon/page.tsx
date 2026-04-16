import { Metadata } from 'next'
import Link from 'next/link'
const SITE_NAME = 'EndOverPay'
export const metadata: Metadata = {
  title: `Submit a Coupon | ${SITE_NAME}`,
  description: `Submit a coupon code or deal to ${SITE_NAME}.`,
}
export default function SubmitCouponPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl font-extrabold mb-2">Submit a Coupon</h1>
          <p className="text-white/80">Help the community save more!</p>
        </div>
      </div>
      <div className="container-main py-12 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <p className="text-gray-600 leading-relaxed">Found a great deal or coupon code that is not listed on EndOverPay? Share it with our community and help thousands of shoppers save money.</p>
          <div className="bg-primary-50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">How to Submit</h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>Email us at <strong>submit@endoverpay.com</strong></li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>Include the store name, coupon code, discount amount and expiry date</li>
              <li className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>Our team will verify and publish the coupon within 24 hours</li>
            </ol>
          </div>
          <p className="text-sm text-gray-500">You can also <Link href="/contact" className="text-primary-500 hover:underline font-semibold">contact us</Link> for any questions.</p>
        </div>
      </div>
    </div>
  )
}
