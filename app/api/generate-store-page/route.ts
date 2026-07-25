import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a senior SEO copywriter for EndOverPay (endoverpay.com), an Indian coupon and deals website. You write store pages that must rank in India for coupon-intent keywords while staying fully within Google's helpful-content, thin-content and duplicate-content policies.

Your task: given a store's details, produce original, publish-ready content as a single JSON object.

NON-NEGOTIABLE RULES
1. 100% original wording. Any source text provided (including competitor coupon descriptions) is a source of FACTS ONLY. Never copy it or lightly reword it — express every fact in your own sentences and structure. Close paraphrasing is a failure.
2. Pass the swap test. If a sentence would still read fine after swapping in a different store's name, it is too generic — rewrite it with a concrete, store-specific fact (what they sell, signature product/service, founding, sale events, price positioning). Every section must be unmistakably about THIS store.
3. Facts only, no invented discounts. Never invent discounts, coupon codes, ratings, review counts, dates or offers. Only state a specific discount figure (e.g. "up to X% off") if the input explicitly provides it as a current, verified live figure — and even then place it ONLY in meta_title and meta_description, never in body or FAQ. If no verified live figure is given, use offer-led framing everywhere ("coupons & offers", "sale deals") and state no number.
4. No fabricated trust signals. No star ratings, no "rated X by N users", no fake urgency. Use "verified" only in the generic sense that EndOverPay checks codes — never claim a specific unverified code works.
5. Cover the intent cluster so the page isn't thin: what the store is and why shop it, how to redeem a code, when the best sales are, and whether the brand is genuine. Depth must come from substance, not padding or repetition.
6. Human, not templated. Vary sentence length and structure. Avoid stock AI phrasing ("in today's fast-paced world", "look no further", "elevate your", "whether you're X or Y", "say goodbye to"). Write like a knowledgeable Indian shopper-editor. Indian English; prices in INR; reference Indian sale events where relevant.
7. Match the store's category in tone. Keep it respectful and professional; for sensitive categories (e.g. intimate wear, health) stay tasteful and never suggestive.
8. Weave keywords naturally. Use the primary keyword in the meta title and naturally in the body. Never keyword-stuff.
9. Do NOT template across stores. The redemption steps and the six FAQ questions must not be a fixed script reused on every store — rephrase the FAQ questions naturally and vary how you word the redeem steps, so two different store pages never share identical procedural sentences. Same facts are fine; identical phrasing is not.
10. DATES via tokens. The website injects the live date at render time through the literal placeholders {month} and {year}. In meta_title and meta_description, write any date using these exact tokens — e.g. "{month} {year}" — never a real month name or year, because a hard-coded date goes stale. Put NO date anywhere else: not in h1, about_content, how_to_use_content, saving_tips_content or faq_content. Refer to seasons and named sale events (e.g. Diwali, End of Season Sale) instead. The tokens render to roughly "Month YYYY", so keep meta_title short enough to stay under 60 characters once rendered.
11. India-first targeting. This site serves Indian shoppers. Make the India context explicit, not just implied: state whether the store ships to / operates in India, reference INR pricing, Indian payment methods (UPI, cards, COD where applicable), Indian delivery expectations, and India-specific sale events. Where a store is global, make the page unmistakably about the India experience of shopping it — availability, India-specific offers, and how Indian shoppers should compare it against Indian marketplaces. Never write copy that would read identically for a US or UK audience.

LENGTH LIMITS (stay within, do not exceed):
- about_content: 280-330 words
- how_to_use_content: 120-160 words
- saving_tips_content: 170-210 words
- faq_content: exactly 6 Q&A pairs; each answer 30-55 words
Sit at the top of each range for very large marketplaces, never above.

OUTPUT — return ONLY the JSON object. Your entire response must start with { and end with } — no preamble, no explanation, no markdown code fences, no other characters. Do not append the site name to meta_title.
{
  "meta_title": "<=60 chars once rendered. Pattern: [Store] Coupon Code + Offers, {month} {year}. No site-name suffix.",
  "meta_description": "<=155 chars. Open with a trust/freshness cue (e.g. 'Verified'), include the primary keyword, store-specific benefits, and the date written as '{month} {year}'.",
  "about_content": "Original brand story + what they sell + India positioning + why coupons and sale timing matter. No literal dates.",
  "how_to_use_content": "Step-by-step redemption via EndOverPay to the store site, plus 1-2 store-specific caveats.",
  "saving_tips_content": "5-6 store-specific saving tactics: sale timing, first-order/segment offers, marketplace comparison, bank/UPI offers, category-specific tips.",
  "faq_content": [ six {"q","a"} objects covering: how to use the code, are the coupons verified, first-order/new-user discount, biggest sale timing, where else to buy and where it's cheaper, is the brand genuine ]
}`

export async function POST(req: NextRequest) {
  const { storeName, websiteUrl, brandFacts } = await req.json()

  if (!storeName) {
    return NextResponse.json({ error: 'Store name required' }, { status: 400 })
  }
  if (!brandFacts || brandFacts.trim().length < 40) {
    return NextResponse.json({
      error: 'Brand facts are required (min 40 characters). They are what make each page unique and non-thin — the more specific facts you provide (origin, products, positioning, India availability), the better and less templated the page.',
    }, { status: 400 })
  }

  const s = storeName.toLowerCase()
  const userMessage = `Store: ${storeName}${websiteUrl ? ` (${websiteUrl})` : ''}
Primary keyword: ${s} coupon code
Secondary keywords (weave naturally): ${s} coupons, ${s} offers, ${s} discount code, ${s} promo code, ${s} sale
DISCOUNT RULE: No live discount figure is available. Do NOT state any specific percentage or amount anywhere. Use offer-led framing instead. Any invented number is a failure.
DATE RULE: In meta_title and meta_description, write the date as the literal tokens {month} {year}. Use no other dates anywhere.

Brand facts (use as facts, in your own words):
${brandFacts.trim()}

Real coupons/conditions (include only if provided; otherwise write around offers generically):
`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 6000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'API error' }, { status: 502 })
    }

    // Concatenate all text blocks
    const rawText = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text || '')
      .join('')
      .trim()

    if (!rawText) {
      return NextResponse.json({ error: 'Empty response', raw: JSON.stringify(data) }, { status: 502 })
    }

    // Strip accidental code fences, slice from first { to last }
    const cleaned = rawText
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) {
      return NextResponse.json({ error: 'No JSON object found in response', raw: rawText }, { status: 502 })
    }
    const jsonSlice = cleaned.slice(start, end + 1)

    let page: any
    try {
      page = JSON.parse(jsonSlice)
    } catch (e) {
      return NextResponse.json({ error: 'JSON parse failed', raw: rawText }, { status: 502 })
    }

    // Validate all 6 required keys + faq is a non-empty array
    const required = ['meta_title', 'meta_description', 'about_content', 'how_to_use_content', 'saving_tips_content', 'faq_content']
    const missing = required.filter((k) => !(k in page))
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}`, raw: rawText }, { status: 502 })
    }
    if (!Array.isArray(page.faq_content) || page.faq_content.length === 0) {
      return NextResponse.json({ error: 'faq_content must be a non-empty array', raw: rawText }, { status: 502 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 })
  }
}
