import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact EndOverPay – Get in Touch',
  description: 'Contact EndOverPay for coupon submissions, partnership inquiries, expired code reports or general feedback. We respond within 24-48 hours.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-14">
        <div className="container-main text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">We are here to help. Whether you have a question, a suggestion or a coupon to share — we would love to hear from you.</p>
        </div>
      </div>

      <div className="container-main py-12 max-w-4xl mx-auto space-y-8">

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📧', title: 'General Enquiries', desc: 'For general questions, feedback or suggestions.', email: 'hello@endoverpay.com' },
            { icon: '🤝', title: 'Partnerships', desc: 'For retailers, brands and affiliate partnerships.', email: 'partners@endoverpay.com' },
            { icon: '🎟️', title: 'Submit a Coupon', desc: 'Found a deal we are missing? Share it with us.', email: 'submit@endoverpay.com' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">{item.desc}</p>
              <a href={`mailto:${item.email}`} className="text-[#EA580C] font-semibold text-sm hover:underline">{item.email}</a>
            </div>
          ))}
        </div>

        {/* What to Include */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Can You Contact Us About?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '❌', title: 'Report an Expired Coupon', desc: 'If a coupon is not working, let us know the store name and code and we will remove or update it within 24 hours.' },
              { icon: '➕', title: 'Submit a New Coupon', desc: 'Found a deal we do not have listed? Send us the store name, coupon code, discount amount and expiry date.' },
              { icon: '🤝', title: 'Business & Partnerships', desc: 'Are you a brand or retailer looking to list your deals on EndOverPay? We would love to discuss partnership options.' },
              { icon: '💡', title: 'Feedback & Suggestions', desc: 'Have ideas to improve our platform? We take user feedback seriously and read every message we receive.' },
              { icon: '🐛', title: 'Report a Technical Issue', desc: 'If something on our site is not working as expected, please describe the issue and we will look into it promptly.' },
              { icon: '📰', title: 'Media & Press Inquiries', desc: 'For press mentions, media coverage or editorial requests, please reach out to our team at hello@endoverpay.com.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Response Times</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'General Enquiries', time: 'Within 24-48 hours' },
              { label: 'Expired Coupon Reports', time: 'Within 24 hours' },
              { label: 'Partnership Inquiries', time: 'Within 2-3 business days' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 text-center border border-orange-100">
                <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                <p className="font-bold text-[#EA580C]">{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Help</h2>
          <div className="space-y-3">
            {[
              { q: 'Why is my coupon code not working?', a: 'Coupon codes may have expired, reached their usage limit or may only apply to specific products. Check the terms listed on the coupon or report it to us.' },
              { q: 'Are all coupons on EndOverPay free to use?', a: 'Yes — all deals on EndOverPay are completely free. We never charge users to access coupon codes or deals.' },
              { q: 'How do I submit a coupon I found?', a: 'Email submit@endoverpay.com with the store name, coupon code, discount amount and expiry date. Our team will verify and publish it.' },
              { q: 'Does EndOverPay have a mobile app?', a: 'We do not have a dedicated app yet, but our website is fully optimised for mobile browsers on iOS and Android.' },
            ].map((item) => (
              <details key={item.q} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-orange-50 transition-colors list-none">
                  <span className="font-semibold text-gray-900 text-sm">{item.q}</span>
                  <span className="text-gray-400 group-open:rotate-90 transition-transform">›</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
