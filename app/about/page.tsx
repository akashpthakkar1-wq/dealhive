import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About EndOverPay – Verified Coupon Codes & Deals Platform',
  description: 'Learn how EndOverPay helps millions of shoppers save money with verified coupon codes, promo codes and exclusive deals from 500+ stores worldwide.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] text-white py-14">
        <div className="container-main text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">About EndOverPay</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">We exist for one reason — to help you stop overpaying.</p>
        </div>
      </div>

      <div className="container-main py-12 max-w-4xl mx-auto space-y-8">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is EndOverPay?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            EndOverPay is a global coupon and deals platform that helps shoppers find verified coupon codes, promo codes, voucher codes and exclusive discounts from hundreds of top online stores. Whether you are shopping for fashion, electronics, food delivery, travel or beauty — we have deals that save you real money.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We are not a generic link aggregator. Every coupon on EndOverPay is manually reviewed by our team before it goes live. We test codes, verify expiry dates and remove anything that does not deliver genuine savings. Our goal is simple — when you click a coupon on our site, it works.
          </p>
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose EndOverPay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '✅', title: 'Manually Verified Codes', desc: 'Every coupon is tested by our team before publishing. No bots, no scrapers.' },
              { icon: '🔄', title: 'Updated Daily', desc: 'Our team adds new deals every day and removes expired codes within hours.' },
              { icon: '🌍', title: 'Global Coverage', desc: 'We cover stores across the US, UK, Canada, India and 50+ other countries.' },
              { icon: '🆓', title: 'Completely Free', desc: 'No signup, no subscription. All deals are free to access for every user.' },
              { icon: '🏪', title: '500+ Stores', desc: 'From global giants like Amazon to niche stores, we cover every category.' },
              { icon: '🔒', title: 'Transparent & Honest', desc: 'We earn commissions through affiliate links — but this never influences which deals we list.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How We Find Coupons */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Find & Verify Coupons</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our coupon discovery process is built around accuracy, not volume. Here is how it works:
          </p>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Source', desc: 'We monitor official store newsletters, affiliate networks, brand social media accounts and user submissions to find new deals as soon as they go live.' },
              { step: '2', title: 'Verify', desc: 'Our team manually tests each coupon code at checkout to confirm it applies the correct discount. We check minimum order requirements, eligible product categories and expiry dates.' },
              { step: '3', title: 'Publish', desc: 'Only verified, working coupons are published. Each listing clearly shows the discount amount, expiry date, usage count and verification status.' },
              { step: '4', title: 'Monitor & Remove', desc: 'We track coupon performance daily. Expired or non-working codes are removed within 24 hours of detection.' },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{item.step}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Types of Deals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Deals We Cover</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: '🏷️', label: 'Coupon Codes' },
              { icon: '💸', label: 'Promo Codes' },
              { icon: '🎟️', label: 'Voucher Codes' },
              { icon: '🔖', label: 'Discount Codes' },
              { icon: '🆓', label: 'Free Shipping Offers' },
              { icon: '🛍️', label: 'Buy One Get One Deals' },
              { icon: '📅', label: 'Seasonal Sale Offers' },
              { icon: '🎁', label: 'Student & NHS Discounts' },
              { icon: '📱', label: 'App-Exclusive Deals' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span>{item.icon}</span>
                <span className="text-sm font-semibold text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Affiliate Disclosure</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            EndOverPay participates in affiliate marketing programs. This means when you click a coupon link and make a purchase, we may earn a small commission from the retailer — at absolutely no extra cost to you.
          </p>
          <p className="text-gray-600 leading-relaxed">
            This commission is how we keep the platform free and fund our team to verify deals daily. It never influences which coupons we list or how we rank them. We do not accept payment to feature specific deals and we do not list coupons we have not verified ourselves.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            "To make saving money effortless — by delivering the most accurate, up-to-date coupon codes and deals from the world's best stores, completely free."
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/stores" className="btn-primary">Browse All Stores</Link>
            <Link href="/contact" className="btn-secondary">Contact Us</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
