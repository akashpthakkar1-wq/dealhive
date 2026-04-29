import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About EndOverPay – Our Story, Mission & How We Verify Coupons',
  description: 'EndOverPay was founded by Akash Thakkar, a marketing professional with 18+ years of experience at Vodafone, Spice Digital and OnMobile, to solve one frustrating problem — coupon codes that never work.',
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EA580C] to-[#9A3412] flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">A</div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Akash Thakkar</p>
              <p className="text-gray-500 text-sm">Founder, EndOverPay · Marketing Professional, 18+ Years Experience</p>
              <p className="text-gray-500 text-sm">Ex Vodafone · Ex Spice Digital · Ex OnMobile Pvt Ltd · Ahmedabad, India</p>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">Hi, I am Akash Thakkar — a marketing professional with over 18 years of experience and the founder of EndOverPay.</p>
          <p className="text-gray-600 leading-relaxed mb-4">Over the course of my career, I have worked with some of India&apos;s most recognised companies — Vodafone, Spice Digital and OnMobile Pvt Ltd. Across these roles, I sat on the brand side of marketing, watching how companies designed promotions, discount campaigns and affiliate programs from the inside. I understood exactly how these deals were created — and more importantly, how they were distributed.</p>
          <p className="text-gray-600 leading-relaxed mb-4">After 18 years in the industry, I noticed something that genuinely bothered me. Brands were spending millions on promotions and discount campaigns — but the people those campaigns were designed for, everyday shoppers, were rarely getting the benefit. The coupon codes would expire without notice. They would be listed on aggregator sites months after they stopped working. Shoppers would spend 30 minutes trying code after code, only to give up and pay full price.</p>
          <p className="text-gray-600 leading-relaxed mb-4">I spoke to friends, family and colleagues about it. Every single one of them had the exact same frustration. They were all spending more time hunting for working coupons than actually shopping. And as someone who had spent nearly two decades understanding how digital marketing and affiliate programs actually work, I knew this problem was completely solvable.</p>
          <p className="text-gray-600 leading-relaxed font-medium text-gray-800">So in April 2026, I decided to fix it. That is how EndOverPay was born.</p>
        </div>

        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why EndOverPay Exists</h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-lg font-medium">EndOverPay was built on one simple promise — every coupon on this platform actually works.</p>
          <p className="text-gray-600 leading-relaxed mb-4">Not &quot;works sometimes.&quot; Not &quot;worked last week.&quot; Works today, at the time you are reading this.</p>
          <p className="text-gray-600 leading-relaxed mb-4">Having worked inside major brands and digital marketing companies, I know exactly how affiliate programs and coupon distribution works. I built EndOverPay using that insider knowledge — to create a platform where verification is not an afterthought, it is the entire process.</p>
          <p className="text-gray-600 leading-relaxed">We manually verify every single coupon before it goes live. We test the code at checkout. We check the minimum order value. We confirm the expiry date. If it does not work, it does not get published. Period.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed mb-4">EndOverPay was founded by Akash Thakkar, a marketing professional with 18+ years of experience working with leading companies including Vodafone, Spice Digital and OnMobile Pvt Ltd. That background gives us a unique advantage — we understand how brands design their promotions, which means we know exactly where to find genuine deals and how to verify them properly.</p>
          <p className="text-gray-600 leading-relaxed mb-4">We are a lean, focused team. No automated scrapers. No bots pulling codes from other websites. Every coupon on EndOverPay is sourced and verified by real people who understand affiliate marketing from the inside.</p>
          <p className="text-gray-600 leading-relaxed">We are based in Ahmedabad, India, and we cover both Indian stores — Myntra, Flipkart, Swiggy, Nykaa and more — as well as global brands. Our goal is to be the most trusted coupon platform for Indian shoppers, and the most reliable one for anyone shopping online worldwide.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Find &amp; Verify Coupons</h2>
          <p className="text-gray-600 leading-relaxed mb-6">Our coupon discovery process is built around accuracy, not volume. Here is how it works:</p>
          <ol className="space-y-4">
            {[
              { step: "1", title: "Source", desc: "We monitor official store newsletters, affiliate networks, brand social media accounts and user submissions to find new deals as soon as they go live. Our marketing background means we know exactly where brands publish their best offers." },
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed mb-4">I started EndOverPay with a clear vision — to build the most trusted coupon platform in India.</p>
          <p className="text-gray-600 leading-relaxed mb-4">Not the biggest. Not the one with the most codes. The most trusted. The one where every deal you click actually works.</p>
          <p className="text-gray-600 leading-relaxed mb-6">As we grow, we will expand our store coverage, add more categories, build a community of deal hunters and create tools that automatically alert you when a working deal goes live for stores you love. My 18 years of marketing experience gives me a clear roadmap for how to build something that genuinely serves shoppers — and I am committed to doing exactly that.</p>
          <div className="border-t border-gray-100 pt-6">
            <p className="text-gray-700 font-medium italic mb-1">&quot;We are just getting started. And if you have made it this far, I would love for you to be part of this journey.&quot;</p>
            <p className="text-gray-500 text-sm">— Akash Thakkar, Founder · EndOverPay · Ahmedabad, India · April 2026</p>
          </div>
        </div>

        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Affiliate Disclosure</h2>
          <p className="text-gray-600 leading-relaxed mb-3">EndOverPay participates in affiliate marketing programs. This means when you click a coupon link and make a purchase, we may earn a small commission from the retailer — at absolutely no extra cost to you.</p>
          <p className="text-gray-600 leading-relaxed">This commission is how we keep the platform free and fund our work to verify deals daily. It never influences which coupons we list or how we rank them. We do not accept payment to feature specific deals and we do not list coupons we have not verified ourselves.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose EndOverPay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "✅", title: "Manually Verified Codes", desc: "Every coupon is tested before publishing. No bots, no scrapers — just genuine verification." },
              { icon: "🔄", title: "Updated Daily", desc: "New deals added every day. Expired codes removed within 24 hours of detection." },
              { icon: "🌍", title: "India + Global Coverage", desc: "Top Indian stores like Myntra, Flipkart, Swiggy plus global brands worldwide." },
              { icon: "🆓", title: "Completely Free", desc: "No signup, no subscription. All deals are free to access for every shopper." },
              { icon: "💼", title: "18+ Years Marketing Expertise", desc: "Founded by a marketing professional who has worked inside major brands — we know how affiliate programs work." },
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

        <div className="bg-gradient-to-br from-[#EA580C] to-[#9A3412] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Start Saving?</h2>
          <p className="text-white/80 mb-6">Browse verified coupons from your favourite stores — all free, all working.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/stores" className="bg-white text-[#EA580C] font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">Browse All Stores</Link>
            <Link href="/contact" className="border border-white/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">Get in Touch</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
