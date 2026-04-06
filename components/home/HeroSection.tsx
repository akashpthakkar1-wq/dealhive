import { TrendingUp, Shield, Zap } from 'lucide-react'
import SearchBar from '@/components/layout/SearchBar'

export default function HeroSection() {
  const stats = [
    { icon: TrendingUp, label: '3,200+ Active Deals', color: 'text-orange-500' },
    { icon: Shield, label: '100% Verified', color: 'text-green-500' },
    { icon: Zap, label: 'Updated Daily', color: 'text-blue-500' },
  ]
  return (
    <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 text-white py-16 md:py-20">
      <div className="container-main text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          1,240 people saving right now
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
          Save Big on Every<br />
          <span className="text-yellow-300">Purchase</span> You Make
        </h1>
        <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
          India&apos;s most trusted coupon platform. Verified codes, real savings, zero hassle.
        </p>
        <div className="max-w-lg mx-auto mb-8">
          <SearchBar />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {stats.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
