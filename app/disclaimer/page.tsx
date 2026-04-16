import { Metadata } from 'next'
const SITE_NAME = 'EndOverPay'
export const metadata: Metadata = {
  title: `Disclaimer | ${SITE_NAME}`,
  description: `Disclaimer for ${SITE_NAME}.`,
}
export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl font-extrabold mb-2">Disclaimer</h1>
          <p className="text-white/80">Last updated: April 2026</p>
        </div>
      </div>
      <div className="container-main py-12 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6 text-gray-600 leading-relaxed">
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Affiliate Disclaimer</h2>
          <p>EndOverPay participates in various affiliate marketing programs. This means we may earn a commission when you click on links to products or services and make a purchase. This comes at no additional cost to you.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">Coupon Accuracy</h2>
          <p>While we make every effort to ensure coupon codes are valid and accurate, we cannot guarantee that all codes will work. Coupon codes may expire or be discontinued by retailers without notice. Always check the terms of each coupon before use.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">No Endorsement</h2>
          <p>The presence of a store or product on EndOverPay does not constitute an endorsement. We provide information about deals and discounts as a service to our users.</p></div>
          <div><h2 className="text-xl font-bold text-gray-900 mb-3">External Links</h2>
          <p>Our website contains links to external websites. We have no control over these sites and accept no responsibility for their content or privacy practices.</p></div>
        </div>
      </div>
    </div>
  )
}
