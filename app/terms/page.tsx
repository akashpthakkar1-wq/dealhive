import { Metadata } from 'next'
const SITE_NAME = 'EndOverPay'
export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
  description: `Terms of Service for ${SITE_NAME}.`,
}
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl font-extrabold mb-2">Terms of Service</h1>
          <p className="text-white/80">Last updated: April 2026</p>
        </div>
      </div>
      <div className="container-main py-12 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 text-gray-600 leading-relaxed">
          <p>By using EndOverPay, you agree to these terms. Please read them carefully.</p>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Use of Website</h2>
          <p>EndOverPay provides coupon codes and deals for personal, non-commercial use. You may not use this site for any illegal purpose or in violation of any regulations.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Accuracy of Information</h2>
          <p>We strive to provide accurate and up-to-date coupon codes. However, we cannot guarantee that all coupons are valid or that discounts will be applied. Always verify at checkout.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Affiliate Disclosure</h2>
          <p>EndOverPay earns commissions through affiliate links. This does not affect the price you pay. We only recommend genuine deals that provide real value.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Intellectual Property</h2>
          <p>All content on this website is owned by EndOverPay. You may not reproduce or distribute content without permission.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Limitation of Liability</h2>
          <p>EndOverPay is not liable for any damages arising from use of this website or reliance on coupon codes listed here.</p></div>
        </div>
      </div>
    </div>
  )
}
