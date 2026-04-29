import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About EndOverPay – Our Story, Mission & How We Verify Coupons',
  description: 'EndOverPay was founded by Payal Mulia, an IIM Ahmedabad MBA student, to solve one frustrating problem — coupon codes that never work. Learn our story.',
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

        {/* Founder Story */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EA580C] to-[#9A3412] flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
              P
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Payal Mulia</p>
              <p className="text-gray-500 text-sm">Founder, EndOverPay · MBA Student, IIM Ahmedabad · Ahmedabad, India</p>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Hi, I am Payal Mulia — an MBA student at IIM Ahmedabad and the founder of EndOverPay.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Like most people my age, I shop online a lot. Fashion, beauty, food delivery, travel — if it is available online, I am probably buying it. And like any smart shopper, I always look for discounts before hitting the buy button.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            But here is what frustrated me every single time. I would visit a coupon website, find what looked like a great deal, copy the code, go through the entire checkout process — and then get hit with &quot;Invalid coupon code.&quot; So I would try another site. Same result. Then another. An hour later, I would either give up or pay full price, feeling completely cheated.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            I spoke to my friends about it. Every single one of them had the exact same experience. We were all spending more time hunting for working coupons than actually shopping. That felt completely wrong.
          </p>
          <p className="text-gray-600 leading-relaxed font-medium text-gray-800">
            So in April 2026, I decided to fix it. That is how EndOverPay was born.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why EndOverPay Exists</h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-lg font-medium">
            EndOverPay was built on one simple promise — every coupon on this platform actually works.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Not &quot;works sometimes.&quot; Not &quot;worked last week.&quot; Works today, at the time you are reading this.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            We manually verify every single coupon before it goes live. We test the code at checkout. We check the minimum order value. We confirm the expiry date. If it does not work, it does not get published. Period.
          </p>
          <p className="text-gray-600 leading-relaxed">
            I know how frustrating it is to waste 30 minutes hunting for a discount that never materialises. That frustration is exactly why I built this — so you do not have to go through what I did.
          </p>
        </div>

        {/* Who We Are */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Right now, EndOverPay is a one-person operation. I run it solo — researching deals, verifying coupons, building the platform and writing the content. No team of bots. No automated scrapers pulling codes from other websites.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Just me, genuinely checking every coupon so you do not have to.
          </p>
          <p className="text-gray-600 leading-relaxed">
            I am currently pursuing my MBA from IIM Ahmedabad — one of India&apos;s most respected business schools. Building EndOverPay alongside my studies has taught me more about real business than any textbook could. Every decision I make here — from which stores to feature to how we verify coupons — is driven by what I would want as a shopper myself.
          </p>
        </div>

        {/* How We Verify */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Find &amp; Verify Coupons</h2>
          <p className="text-gray-600 leading-relaxed mb-6">Our coupon discovery process is built around accuracy, not volume. Here is how it works:</p>
          <ol className="space-y-4">
            {[
              { step: "1", title: "Source", desc: "We monitor official store newsletters, affiliate networks, brand social media accounts and user submissions to find new deals as soon as they go live." },
              { step: "2", title: "Verify", desc: "Every coupon code is manually tested at checkout to confirm it applies the correct discount. We check minimum order requirements, eligible product categories and expiry dates." },
              { step: "3", title: "Publish", desc: "Only verified, working coupons are published. Each listing clearly shows the discount amount, expiry date, usage count and verification status." },
              { step: "4", title: "Monitor & Remove", desc: "We track coupon performance daily. Expired or non-working codes are removed within 24 hours of detection." },
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

        {/* Values */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Core Values</h2>
          <div className="space-y-5">
            {[
              { icon: "🎯", title: "Honesty First", desc: "We only publish coupons we have verified ourselves. We do not inflate success rates or pretend expired codes work." },
              { icon: "👤", title: "User Over Revenue", desc: "We earn affiliate commissions when you shop — but that never influences which coupons we list or how we rank them. A broken coupon never goes live just because a brand paid us." },
              { icon: "⚡", title: "Simplicity Always", desc: "Finding a working coupon should take 30 seconds, not 30 minutes. That is the experience we are building toward every day." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            I started EndOverPay as a solo project, but my dreams for it are much bigger.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            I want EndOverPay to be the most trusted coupon platform in India — the place every online shopper visits before they checkout. Not because we have the most coupons, but because ours actually work.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            As we grow, we will expand our store coverage, add more categories, build a community of deal hunters and eventually create tools that automatically alert you when a working deal goes live for stores you love.
          </p>
          <div className="border-t border-gray-100 pt-6">
            <p className="text-gray-700 font-medium italic mb-1">&quot;We are just getting started. And if you have made it this far, I would love for you to be part of this journey.&quot;</p>
            <p className="text-gray-500 text-sm">— Payal Mulia, Founder · EndOverPay · Ahmedabad, India · April 2026</p>
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Affiliate Disclosure</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            EndOverPay participates in affiliate marketing programs. This means when you click a coupon link and make a purchase, we may earn a small commission from the retailer — at absolutely no extra cost to you.
          </p>
          <p className="text-gray-600 leading-relaxed">
            This commission is how we keep the platform free and fund our work to verify deals daily. It never influences which coupons we list or how we rank them. We do not accept payment to feature specific deals and we do not list coupons we have not verified ourselves.
          </p>
        </div>

        {/* Why Choose */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose EndOverPay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "✅", title: "Manually Verified Codes", desc: "Every coupon is tested before publishing. No bots, no scrapers — just genuine verification." },
              { icon: "🔄", title: "Updated Daily", desc: "New deals added every day. Expired codes removed within 24 hours of detection." },
              { icon: "🌍", title: "India + Global Coverage", desc: "Top Indian stores like Myntra, Flipkart, Swiggy plus global brands worldwide." },
              { icon: "🆓", title: "Completely Free", desc: "No signup, no subscription. All deals are free to access for every shopper." },
              { icon: "🏪", title: "Growing Store Directory", desc: "From food delivery to fashion to travel — we cover every category you shop." },
              { icon: "🔒", title: "Transparent & Honest", desc: "Affiliate commissions fund us — but never influence which deals we publish." },
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

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Start Saving?</h2>
          <p className="text-white/80 mb-6">Browse verified coupons from your favourite stores — all free, all working.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/stores" className="bg-white text-[#EA580C] font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
              Browse All Stores
            </Link>
            <Link href="/contact" className="border border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
