# EndOverPay Project Reference

## Live Site
URL: https://www.endoverpay.com
GitHub: https://github.com/akashpthakkar1-wq/dealhive
Vercel: akashpthakkar1-6819s-projects/dealhive

## Supabase
Project: tgotmpnebrqqfbxucdax
URL: https://tgotmpnebrqqfbxucdax.supabase.co

## Admin
URL: /admin/coupons
Password: Riva@2016

## GA4 ID: G-K8ESRFKELG

## Revalidate Secret: endoverpay_revalidate_2026

## Current Stores (10)
AliExpress, Amazon, Flipkart, MakeMyTrip, Myntra, Nykaa, SHEIN, Swiggy, Temu, Zomato

## SEO Compliance Rules (standing)
- All outbound merchant links must carry rel="sponsored nofollow". Store-page template links are already compliant; verify any NEWLY-added outbound `<a href>` link to a merchant.
- Store title/H1/meta_description support manual overrides via admin "SEO Overrides" fields. Blank = auto-generated fallback. Use {month}, {year}, {month_short} tokens for auto-updating dates.
- Every store needs UNIQUE about/how-to/tips/FAQ content (swap test: if you can swap the store name and it still reads fine, it's too generic).
- Rollout pace: max 5-10 new stores/week (avoids scaled-content-abuse flag).
- KNOWN RISK: AggregateRating JSON-LD on store pages uses fabricated rating/review numbers — manual-action risk; replace with real vote widget.

## Pending Tasks
1. Add 30+ new stores (India + Global)
2. Set Deal of Day Slots 4 and 5
3. Submit sitemap to Google Search Console
4. Fix SHEIN logo black background
5. Add og-default.jpg to /public/
6. Write blog posts
7. GA4 Key Events setup

## Multi-Country Strategy (decided, mostly deferred)

**Decision: India-only focus now. Root = India, permanently.**
- Rationale: couponsly.in proved the low-KD Indian D2C long tail is a huge un-mined
  opportunity (0->8.5K/day in 6mo, AS 32, ~180 ref domains — content/store-selection
  driven, NOT backlink driven). Don't split focus until India is saturated.
- Expansion (future only): endoverpay.com/ph/, /my/, /us/ as subdirectories.
  India stays at root — NEVER retrofit into /in/ (would force 301 migration of ranked URLs).
- Sequence when expanding: PH/MY before US (lower competition; US has RetailMeNot/Honey/etc).

**DONE now (zero-risk hedge):**
- stores.country column added, TEXT NOT NULL DEFAULT 'in'. All 10 stores = 'in'.

**DEFERRED until expansion is a firm decision (do NOT do early):**
- Slug uniqueness: change from unique(slug) -> unique(country, slug). Needed because
  /ph/store/shein and /store/shein share slug 'shein', differ only by country.
- Composite index on (country, slug) — the lookup key for /[country]/store/[slug].
- /ph//my//us/ routing, hreflang (en-in root, en-ph, en-my, en-us, x-default),
  self-referencing canonicals, currency (Rs/PHP/RM/$), localized content per country.
- Routing map: /store/*, /category/*, /search, India-specific /blog/* = India (root).
  Country mirrors under /ph/ etc. Universal evergreen /blog/* stays at root (authority play).
- Trigger to expand: India low-KD long tail saturated OR expansion becomes resourced decision.
