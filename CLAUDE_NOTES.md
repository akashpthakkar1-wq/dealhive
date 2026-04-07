{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # DealHive - Claude Project Notes\
\
## Live Site\
https://dealsncodes.store\
\
## Tech Stack\
- Next.js 14 App Router\
- Tailwind CSS  \
- Supabase (PostgreSQL)\
- Deployed on Vercel\
- Domain on Hostinger\
\
## Key Files\
- app/page.tsx \'97 Homepage\
- app/store/[slug]/page.tsx \'97 Store page\
- app/coupon/[slug]/page.tsx \'97 Coupon page\
- app/admin/* \'97 Admin panel\
- lib/queries.ts \'97 All Supabase queries\
- types/index.ts \'97 TypeScript types\
- supabase/schema.sql \'97 Database schema\
\
## Admin Panel\
URL: dealsncodes.store/admin\
Password: dealhive2025\
\
## Supabase Tables\
- stores (id, name, slug, logo, description, website_url, category)\
- coupons (id, title, slug, code, discount, type, store_id, expiry_date, is_verified, is_featured, is_trending)\
- categories (id, name, slug, icon)\
- clicks (id, coupon_id, clicked_at)\
- blog_posts (id, title, slug, content, published)\
- site_scripts (id, position, content, is_active)\
\
## Things Already Done\
- Full website deployed \uc0\u9989 \
- Admin panel working \uc0\u9989 \
- Domain dealsncodes.store connected \uc0\u9989 \
- CSV import working \uc0\u9989 \
- SEO store page done \uc0\u9989 \
\
## Pending / To Do\
- [ ] Add more stores and coupons\
- [ ] Set up Google Analytics\
- [ ] Add blog posts}