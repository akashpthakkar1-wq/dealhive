import { Metadata } from 'next'
const SITE_NAME = 'EndOverPay'
export const metadata: Metadata = {
  title: `Contact Us | ${SITE_NAME}`,
  description: `Get in touch with ${SITE_NAME}.`,
}
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl font-extrabold mb-2">Contact Us</h1>
          <p className="text-white/80">We would love to hear from you</p>
        </div>
      </div>
      <div className="container-main py-12 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
              <p className="text-sm text-gray-500">hello@endoverpay.com</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🎫</div>
              <h3 className="font-bold text-gray-900 mb-1">Submit a Coupon</h3>
              <p className="text-sm text-gray-500">Found a deal? Share it with us!</p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Get In Touch</h2>
            <p className="text-gray-600 leading-relaxed">For general enquiries, partnership opportunities, or to report an invalid coupon, please email us at <strong>hello@endoverpay.com</strong>. We aim to respond within 24-48 hours.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">For Businesses</h2>
            <p className="text-gray-600 leading-relaxed">Are you a retailer and would like to list your coupons on EndOverPay? Contact us at <strong>partners@endoverpay.com</strong> to discuss listing options.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
