# 🐝 DealHive – Coupon & Deals Website

A production-ready coupon affiliate website built with **Next.js 14**, **Tailwind CSS**, **Supabase**, and deployable on **Vercel**.

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url> dealhive
cd dealhive
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to **SQL Editor** → New Query
3. Paste and run `supabase/schema.sql` (creates all tables + seeds data)
4. Paste and run `supabase/increment_usage.sql` (creates RPC function)
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=DealHive
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 File Structure

```
dealhive/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout (SEO, scripts)
│   ├── not-found.tsx               # 404 page
│   ├── sitemap.ts                  # Dynamic XML sitemap
│   ├── robots.ts                   # robots.txt
│   ├── store/[slug]/page.tsx       # Store detail page
│   ├── coupon/[slug]/page.tsx      # Coupon detail page
│   ├── category/[slug]/page.tsx    # Category page
│   ├── search/page.tsx             # Search + filter page
│   ├── api/
│   │   ├── track-click/route.ts    # Click tracking API
│   │   └── search/route.ts        # Search API
│   └── admin/
│       ├── layout.tsx              # Admin layout
│       ├── page.tsx                # Dashboard
│       ├── stores/page.tsx         # Stores CRUD
│       ├── categories/page.tsx     # Categories CRUD
│       ├── coupons/page.tsx        # Coupons CRUD
│       ├── blog/page.tsx           # Blog posts CRUD
│       ├── scripts/page.tsx        # Header/Footer scripts
│       └── import/page.tsx         # Bulk import/export
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # Sticky navigation
│   │   ├── SearchBar.tsx           # Live search dropdown
│   │   └── Footer.tsx
│   ├── coupon/
│   │   ├── CouponCard.tsx          # Card with Get Code / Deal reveal
│   │   └── CouponGrid.tsx          # Responsive coupon grid
│   ├── store/
│   │   ├── StoreCard.tsx
│   │   └── StoreGrid.tsx
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── CategoryBar.tsx
│   │   └── SectionHeader.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   └── StatsCard.tsx
│   └── ui/
│       ├── Breadcrumb.tsx
│       └── Pagination.tsx
├── lib/
│   ├── supabase.ts                 # Browser client
│   ├── supabase-server.ts          # Server client + admin client
│   ├── queries.ts                  # All Supabase data queries
│   └── utils.ts                    # Helpers, formatters
├── types/index.ts                  # TypeScript interfaces
├── supabase/
│   ├── schema.sql                  # Full DB schema + seed data
│   └── increment_usage.sql         # RPC function
└── .env.example
```

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `stores` | Store/brand info (name, slug, logo, category) |
| `categories` | Deal categories (fashion, electronics, etc.) |
| `coupons` | Coupon codes and deals |
| `clicks` | Click tracking for analytics |
| `blog_posts` | Blog content |
| `site_scripts` | Header/footer script injection |

### Adding Data

**Via Admin Panel** (recommended): Go to `/admin`

**Via Supabase Dashboard**:
1. Go to your Supabase project → Table Editor
2. Select table and click "Insert Row"

**Via SQL**:
```sql
-- Add a store
INSERT INTO stores (name, slug, logo, description, website_url, category)
VALUES ('Myntra', 'myntra', 'https://logo.clearbit.com/myntra.com', 
        'India''s top fashion platform', 'https://myntra.com', 'Fashion');

-- Add a coupon
INSERT INTO coupons (title, slug, discount, code, type, affiliate_url, store_id, expiry_date, is_verified)
SELECT 'Flat 50% Off Sitewide', 'myntra-50-off', '50% OFF', 'MYN50', 'code',
       'https://myntra.com', id, NOW() + INTERVAL '30 days', true
FROM stores WHERE slug = 'myntra';
```

---

## 🔑 Admin Panel

Access at `/admin`

**Default password**: Set `ADMIN_PASSWORD` in env (not implemented with auth in this version – add Next.js Auth or Supabase Auth to secure it for production).

Features:
- ✅ Dashboard with stats
- ✅ Stores CRUD (with Clearbit logo auto-fetch tip)
- ✅ Categories CRUD with emoji picker
- ✅ Coupons CRUD (code + deal types, verified/featured/trending flags)
- ✅ Blog posts with publish/draft toggle
- ✅ Script manager (header + footer injection)
- ✅ Bulk CSV import with preview
- ✅ Export to CSV/JSON

---

## 🌐 Deploy on Vercel

### Step 1 – Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourusername/dealhive.git
git push -u origin main
```

### Step 2 – Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Add **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_SITE_NAME=DealHive
   ```
5. Click **Deploy**

### Step 3 – Add Custom Domain (optional)

1. In Vercel project → **Settings → Domains**
2. Add your domain → Follow DNS instructions

### Step 4 – Enable ISR (Incremental Static Regeneration)

Pages use `export const revalidate = 3600` (1 hour). 
For real-time updates, change to `revalidate = 0` or use `revalidatePath()` in admin actions.

---

## ⚡ Performance Tips

- Images use `next/image` with lazy loading
- Server Components used for all data fetching
- ISR revalidation set to 1 hour
- Database queries use indexes on `slug`, `store_id`, `category_id`

## 🔍 SEO Features

- Dynamic `<meta>` titles and descriptions per page
- JSON-LD schema markup on coupon and store pages
- Dynamic sitemap at `/sitemap.xml`
- Clean URLs: `/store/shein`, `/coupon/shein-70-off`
- Open Graph tags for social sharing

---

## 📋 CSV Import Format

```csv
title,store_name,type,discount,code,description,affiliate_url,expiry_date,is_verified,is_featured,is_trending,usage_count
"Flat 70% Off on All Clothing",SHEIN,code,"70% OFF",SHEIN70,"No minimum order",https://shein.com,2025-12-31,true,true,false,8420
"Electronics Flash Sale",Amazon,deal,"60% OFF",,"Big savings on mobiles",https://amazon.in,2025-06-30,true,false,true,0
```

- `type`: `code` or `deal`
- `store_name`: Must match exactly a store name in your database
- `expiry_date`: Format `YYYY-MM-DD`
- `is_verified`, `is_featured`, `is_trending`: `true` or `false`

---

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| Next.js 14 (App Router) | Frontend + SSR |
| Tailwind CSS | Styling |
| Supabase | Database + API |
| Vercel | Deployment |
| react-hot-toast | Notifications |
| lucide-react | Icons |
