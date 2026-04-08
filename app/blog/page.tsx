import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// If you have blog_posts table in Supabase, this will fetch them.
// Otherwise it renders a "Coming Soon" UI.

async function getBlogPosts() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Blog – Saving Tips & Coupon Guides | EndOverPay',
  description:
    'Read expert tips on saving money online, coupon strategies, and the latest deals from EndOverPay.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#822a7f] text-white py-12 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">EndOverPay Blog</h1>
        <p className="text-purple-200 text-base max-w-xl mx-auto">
          Saving tips, coupon guides, and the latest deals — straight from our team.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {posts.length === 0 ? (
          // ── Coming Soon state ──────────────────────────────────────────────
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Blog Coming Soon</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We're working on guides to help you save more. Check back soon for
              money-saving tips, coupon strategies, and more.
            </p>

            {/* Placeholder preview cards */}
            <div className="grid sm:grid-cols-2 gap-4 text-left mt-8 opacity-60 pointer-events-none select-none">
              {[
                {
                  icon: '💡',
                  tag: 'Tips',
                  title: 'How to Stack Coupons for Maximum Savings',
                  date: 'Coming soon',
                },
                {
                  icon: '📱',
                  tag: 'Guide',
                  title: 'Best Cashback Apps That Work With EndOverPay',
                  date: 'Coming soon',
                },
                {
                  icon: '🛍️',
                  tag: 'Strategy',
                  title: 'Top 10 Shopping Tricks Every Indian Buyer Should Know',
                  date: 'Coming soon',
                },
                {
                  icon: '🎉',
                  tag: 'Deals',
                  title: 'How to Get the Best Deals During Sale Season',
                  date: 'Coming soon',
                },
              ].map((post, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <span className="text-xs font-semibold bg-purple-100 text-[#822a7f] px-2 py-0.5 rounded-full">
                    {post.tag}
                  </span>
                  <p className="text-2xl mt-3 mb-1">{post.icon}</p>
                  <h3 className="font-bold text-gray-800 text-base leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2">{post.date}</p>
                </div>
              ))}
            </div>

            <Link
              href="/"
              className="mt-10 inline-block bg-[#822a7f] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#6b2268] transition-colors"
            >
              Browse Deals Instead →
            </Link>
          </div>
        ) : (
          // ── Blog posts grid ────────────────────────────────────────────────
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="p-4">
                  {post.category && (
                    <span className="text-xs font-semibold bg-purple-100 text-[#822a7f] px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  )}
                  <h2 className="font-bold text-gray-800 mt-2 mb-1 leading-snug line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(post.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

