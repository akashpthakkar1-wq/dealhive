# EndOverPay Project Reference

_India-focused coupon & deals affiliate website. This doc is the cross-session anchor — a new chat should read this first, then clone the repo for live code._

## Live Site & Infra
- **Production:** https://www.endoverpay.com
- **GitHub (PUBLIC):** https://github.com/akashpthakkar1-wq/dealhive — clone to read current code. **GitHub `main` = live** (Vercel auto-deploys every push).
- **Vercel:** akashpthakkar1-6819s-projects/dealhive
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Supabase (PostgreSQL). Brand color `#EA580C`. Font: Plus Jakarta Sans.
- **Working style:** Owner (Akash) works on a Mac, runs terminal/Python commands that Claude provides and pastes output back. Claude CANNOT access the Mac directly — only pasted output. SQL runs in the Supabase SQL Editor (browser), not the terminal.

## Supabase
- Project ref: `tgotmpnebrqqfbxucdax`
- URL: https://tgotmpnebrqqfbxucdax.supabase.co
- SQL Editor: https://supabase.com/dashboard/project/tgotmpnebrqqfbxucdax/sql/new
- Anon key (public, read-only curl OK): stored in the app; safe for GETs against public tables.

## Admin
- `/admin/stores` and `/admin/coupons`
- (Admin password + secrets: keep OUT of chat and OUT of the committed repo. See Security below.)

## Analytics
- GA4 ID: `G-K8ESRFKELG`
- Google Search Console active. Signal: `/store/myntra` ranking well (~pos 4-5); `/store/shein` = biggest near-term opportunity.

## Current Stores (10, all country='in')
AliExpress, Amazon, Flipkart, MakeMyTrip, Myntra, Nykaa, SHEIN, Swiggy, Temu, Zomato

---

## Content Pipeline (BUILT & LIVE — primary content workflow)
A one-call, fact-driven, full-page content generator. This is the tool for scaling store pages.

- **DB:** `stores.brand_facts` (text) — raw facts you type per store, input to the generator.
- **Route:** `app/api/generate-store-page/route.ts` — POST `{ storeName, websiteUrl, brandFacts }`. Uses `claude-sonnet-5`, `max_tokens 6000`. Rejects brandFacts under 40 chars. Returns `{ page }` with `meta_title`, `meta_description`, `about_content`, `how_to_use_content`, `saving_tips_content`, `faq_content`. Intentionally does NOT return `h1` (set manually). Reads `process.env.ANTHROPIC_API_KEY` (present in Vercel).
- **Admin UI:** `app/admin/stores/ContentGenerator.tsx` has a "Brand Facts → Full Page" panel (textarea bound to `form.brand_facts`, "✨ Generate Full Page" button disabled under 40 chars, sets `content_reviewed: false`, red warning if body copy contains a hard-coded month+year). Existing section-by-section generators kept intact.
- **Old route:** `app/api/generate-store-content/route.ts` also now on `claude-sonnet-5` (section-by-section).
- **System prompt** (embedded verbatim in the route): 11 validated rules — 100% original wording, swap test (must be store-specific), no invented discounts/dates/ratings, offer-led framing unless a real live figure is given, dates only as `{month} {year}` tokens in meta (never body), India-first (INR, UPI, Indian sale events, ships-to-India), anti-templating across stores, length caps per field.
- **Chat widget** `app/api/chat/route.ts` deliberately LEFT on `claude-sonnet-4-5` (live user-facing feature returning strict JSON; change only with its own test).

### Per-store workflow (repeatable)
1. Research brand facts (depth like the Swiggy example is the standard — that quality of input is what makes output good).
2. Paste into Brand Facts box → Generate Full Page.
3. Review, clear any date warning, **set h1 manually**, keep the slug unchanged.
4. Save → revalidate (see below).
5. Watch GSC indexation as pages accumulate.

### Revalidate (make DB changes appear on live page immediately)
Pages use ISR (`revalidate = 3600`, hourly) so changes appear within an hour automatically. For instant refresh, POST server-side with the secret in a header (secret is stored locally as `$EOP_REVAL_SECRET` on the Mac's `.zshrc`):
```
curl -s -X POST "https://www.endoverpay.com/api/revalidate" -H "Content-Type: application/json" -H "x-revalidate-secret: $EOP_REVAL_SECRET" -d '{"storeSlug":"STORE-SLUG"}'
```

---

## Key Files
- `app/store/[slug]/page.tsx` — public store page. `generateMetadata` builds title/meta/og/twitter. `applyDateTokens()` substitutes `{month}`/`{year}`/`{month_short}` at RENDER time (tokens are stored literally in DB; correct behavior). Manual `meta_title`/`meta_description`/`h1` override the auto fallback. Discount numbers are DATA-DRIVEN from real, non-expired coupons (see below). `h1` renders (not a dead column).
- `app/admin/stores/page.tsx` — store admin form. Slug auto-generates ONLY when adding (guarded by `editId`); editing never changes a ranked slug/URL.
- `app/admin/stores/ContentGenerator.tsx` — full-page + section generators.
- `types/index.ts` — Store & Coupon types (incl. `brand_facts`, `country`, `expiry_date`).
- `lib/utils.ts` — `isExpired(dateString)` helper.
- `PROJECT_REFERENCE.md` — this file (also uploaded to the project knowledge base).

---

## SEO Compliance Rules (standing — honesty is the moat)
- Outbound merchant links carry `rel="sponsored nofollow"`. Verify any NEWLY-added merchant `<a href>`.
- Manual SEO overrides via admin; blank = auto fallback. Use `{month}`/`{year}`/`{month_short}` tokens for auto-updating dates — NEVER hard-code a month/year.
- Every store needs UNIQUE about/how-to/tips/FAQ (swap test). The content pipeline enforces this.
- **No fabricated anything:** no invented discounts, ratings, review counts, dates, or "verified/tested daily" claims. Discount numbers must trace to a real, current, non-expired coupon.
- Rollout pace: ramp toward 2-3 stores/day (from 5-10/week) as GSC indexation stays healthy; verification-gated. Watch for "Crawled – currently not indexed" (= thin/stop signal).

## Fixed This Session (all live)
- **Favicon:** stale white-shield `.ico` + orange-square `.svg` removed; moved to Next `app/` icon convention (multi-size ico, 96px png, apple-icon). Awaiting Google recrawl.
- **OG image:** real 1200×630 branded card at `public/og-default.jpg`. (Pending task #5 DONE.)
- **Fabricated discounts REMOVED:** store meta/title no longer hard-codes "90% off"; computes real max discount from coupons, honest "Verified Coupons & Deals" fallback when none. Admin placeholders de-fabricated. (Replaces old fabricated-rating/discount RISK notes — those are resolved.)
- **Slug-on-edit bug fixed:** editing a store no longer changes its ranked URL.
- **Expired coupons excluded from headline discounts:** `metaMaxDiscount` (meta) filters `!isExpired`; body `maxDiscount` uses `activeCoupons`. An expired coupon can no longer drive the meta title, hero "Best Discount", "Best Coupon", or "Today's Best" on any store. "Recently Expired" section still lists them (fine).
- **stores.country column** added (TEXT NOT NULL DEFAULT 'in'; all 10 = 'in') — multi-country hedge.
- **Repo hygiene:** single clean repo at `~/dev/dealhive`; `.DS_Store` gitignored; stale duplicate folder archived.

## Security
- **REVALIDATE_SECRET rotated** — old value (`endoverpay_revalidate_2026`, was committed in client code + shared in chat) is DEAD. New secret stored in Vercel env + locally in `.zshrc` as `$EOP_REVAL_SECRET`. Client-side hardcoded secret removed from `app/admin/coupons/page.tsx` (now relies on ISR + manual server-side revalidate).
- **STILL TO ROTATE:** admin password (was shared in chat). Do before broad exposure.
- Keep all secrets out of chat, terminal history, and the public repo. Use `read -s` when testing secrets.

---

## Strategy (India low-KD expansion — the growth engine)
- **Model:** couponsly.in proved the play — rank `[brand] coupon code` on `/store/[name]` pages for LOW-KD (<20) mid-tier Indian D2C brands. Their growth is CONTENT + STORE-SELECTION driven, not backlinks (~180 ref domains at 8.5K/day). Lesson: **store selection matters more than velocity.**
- **Targets:** mid-tier Indian D2C (healthkart, xyxx, kapiva, astrotalk, hungama, snitch, bewakoof, traya, dot & key, fire-boltt, jaypore, etc.) — NOT mega-retailers (Amazon/Flipkart) where competition is brutal.
- **Content already generated (prior chat) for:** Rapido, Souled Store, Smytten, Cashify, Decathlon (ramp starters).
- **Next action:** pull SEMrush Keyword Magic (`coupon code`, India DB, KD<20, by volume) → rank by volume÷difficulty → prioritized worklist → run through the content pipeline at 2-3/day.
- **Indian sale calendar:** Diwali (Oct) = highest revenue; prep in Sept. Map content to festive calendar.

## Multi-Country Strategy (decided, mostly deferred)
- **India-only now. Root = India, PERMANENTLY.** Expansion (future): `/ph/`, `/my/`, `/us/` subdirectories. NEVER retrofit India into `/in/` (would 301-migrate ranked URLs).
- Sequence when expanding: PH/MY before US (lower competition).
- **DONE:** `stores.country` column (hedge).
- **DEFERRED to expansion:** slug uniqueness → `unique(country, slug)`; composite index; routing; hreflang (en-in root, en-ph/my/us, x-default); self-canonicals; currency; localized content. Categories/search filter through `stores.country` automatically. Universal evergreen `/blog/*` stays at root (authority play).

## Pending Tasks
- **[Highest value] India low-KD store expansion** — pull SEMrush list, run pipeline at 2-3/day.
- **Cookie consent + Google Consent Mode v2** — not legally urgent (India DPDP substantive obligations hit ~May 2027) but recommended before expansion / any EU traffic. GA4 currently loads unconditionally, no banner.
- Rotate admin password (shared in chat).
- Set Deal of Day Slots 4 & 5.
- Fix SHEIN logo black background.
- Write blog posts (incl. universal evergreen authority content — the couponsly stats-page play).
- GA4 Key Events setup.
- Resubmit sitemap / request indexing for new store pages.
- Mr Button store build (target "mr button coupon code", KD ~10).
- Data audit: verify high-discount coupons (e.g. SHEIN 70/80/90%) are real/redeemable since titles now inherit them; delete placeholder/expired seed coupons (e.g. SWIG60).
- Patch Next.js security update (14.2.5 flagged; minor bump — test carefully, separate task).
- Deferred/horizon: Vercel Pro (cold start), Ahrefs Lite (link building), Google Play PWA (only if a legal org entity exists — skips the 12-tester rule).

## Waiting on Google (nothing to do but wait)
- Favicon flip + site-name casing — both re-indexed; days-to-weeks recrawl.

---

## Working Notes / Gotchas
- New chats: **clone the public repo to verify code state**; don't trust memory or uploaded snapshots (prior "delivered" work has been found absent from `main`).
- Keep ALL EndOverPay work inside the single "EOP" project (project memory/knowledge doesn't cross projects).
- Python `str.replace` edits use `assert old in s` guards + single-quoted heredocs (`'PYEOF'`) to avoid shell expansion.
- `zsh: command not found: #` and `event not found` errors come from pasting comment lines / `!` in double quotes — harmless, ignore.
- Build check: `npm run build 2>&1 | tail -6` (looks frozen 1-3 min). Typecheck: `npx tsc --noEmit`.
- Deploy: `git add -A && git commit -m "..." && git push origin main` → ~60-90s Vercel deploy.
