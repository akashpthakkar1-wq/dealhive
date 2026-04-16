import { Metadata } from 'next'
const SITE_NAME = 'EndOverPay'
const SITE_URL = 'https://www.endoverpay.com'
export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `Privacy Policy for ${SITE_NAME} — learn how we collect, use and protect your data.`,
}
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
          <p className="text-white/80">Last updated: April 2026</p>
        </div>
      </div>
      <div className="container-main py-12 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 text-gray-600 leading-relaxed">
          <p>This Privacy Policy describes how {SITE_NAME} ("{SITE_URL}") collects, uses and shares information about you when you use our website.</p>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Information We Collect</h2>
          <p>We collect information you provide directly such as when you submit a coupon or contact us. We also collect usage data automatically including pages visited, time spent and browser type.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">How We Use Information</h2>
          <p>We use information to operate and improve our website, respond to your requests, and send updates about new deals and coupons if you opt in.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Cookies</h2>
          <p>We use cookies to improve your browsing experience and analyze website traffic. You can disable cookies in your browser settings.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Affiliate Links</h2>
          <p>EndOverPay participates in affiliate programs. When you click a coupon link, we may earn a small commission at no extra cost to you.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Third Party Links</h2>
          <p>Our website contains links to third party websites. We are not responsible for the privacy practices of those sites.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
          <p>For privacy questions, please contact us through our contact page.</p></div>
        </div>
      </div>
    </div>
  )
}
