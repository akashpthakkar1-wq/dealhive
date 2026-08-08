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

12. SALE CALENDAR (universal). Produce a short intro (60-110 words) about this store's yearly sale rhythm in India, then a month-by-month table of recurring sale EVENTS. Use only real, recurring India sale events appropriate to the store (e.g. Republic Day, Holi, End of Season Sale, Independence Day, Big Billion/Festive/Diwali, Black Friday, Year-End). Give TENTATIVE months and an EXPECTED discount RANGE phrased as a range ("up to X%") only if generically well-known for that category — otherwise say "major discounts" without a fabricated number. Never claim a specific live sale is on now. Never use literal current dates. Output the table as clean rows inside sale_calendar_content using this exact plain-text row format, one per line: "Sale Event | Tentative Month | Expected Discount". Header row first: "Sale Event | Tentative Month | Expected Discount". No markdown pipes styling beyond the single " | " separators.

13. BANK & UPI OFFERS (universal). 60-100 words on the TYPES of bank, card and UPI offers Indian shoppers commonly see for this store or its category (e.g. instant discounts on specific banks IF named in the facts, EMI, UPI cashback, wallet offers). Describe types honestly and generally; name a specific bank ONLY if it appears in the brand facts. Never fabricate a specific percentage or a specific current bank offer. No literal dates.

14. CUSTOM SECTIONS (category-adaptive — the depth engine). Generate 2 to 5 additional sections that fit THIS store's category and are supported by the brand facts. Choose sections a shopper genuinely needs for this kind of store. Examples by category (illustrative, not mandatory): Fashion/Electronics -> top-selling categories with real brand names, return/exchange policy, shipping & delivery charges, warranty, loyalty programme, first-order offer. Travel -> cancellation & refund policy, date-change charges, baggage allowance, web check-in/booking process, segment (flight/hotel/bus) offers. Food -> membership tiers & benefits, delivery fees explained, first-order offer, sub-services (grocery/instant). GOLDEN RULE: generate a custom section ONLY if the brand facts contain real information to fill it — never invent a policy, a fee, a brand list, or a number. If the facts do not support a section, omit it (fewer sections is fine). HEADING RULES for each custom section: (a) MUST include the store name and, where natural, a keyword variant (policy, offers, guide, charges, discount); (b) MUST accurately describe the content below it; (c) MUST NOT duplicate a universal-section heading (About, How to Use, Saving Tips, FAQ, Sale Calendar, Bank Offers). Each custom section is plain prose (70-130 words), same no-markdown rule as everything else. No literal dates.

LENGTH LIMITS (stay within, do not exceed):
- about_content: 280-330 words
- how_to_use_content: 120-160 words
- saving_tips_content: 170-210 words
- faq_content: exactly 6 Q&A pairs; each answer 30-55 words
- sale_calendar_content: 60-110 words of intro prose (see SALE CALENDAR rule), then the table rows
- bank_offers_content: 60-100 words
- custom_sections: 2 to 5 sections; each content 70-130 words
Sit at the top of each range for very large marketplaces, never above.

OUTPUT — return ONLY the JSON object. Your entire response must start with { and end with } — no preamble, no explanation, no markdown code fences, no other characters. Do not append the site name to meta_title.
PLAIN PROSE ONLY — the text inside every content field (about_content, how_to_use_content, saving_tips_content, and all FAQ answers) must be clean, natural prose. Never use markdown or formatting symbols anywhere in field values: no #, ##, ### headings, no ** or __ for bold, no * or - or • bullet markers, no backticks, no markdown links. Write in flowing sentences and paragraphs only. These fields are rendered directly as HTML, so any stray symbol would appear as literal text on the page.
{
  "meta_title": "<=60 chars once rendered. Pattern: [Store] Coupon Code + Offers, {month} {year}. No site-name suffix.",
  "meta_description": "<=155 chars. Open with a trust/freshness cue (e.g. 'Verified'), include the primary keyword, store-specific benefits, and the date written as '{month} {year}'.",
  "hero_summary": "A rich, COUPON/DEALS-FOCUSED summary for the top of the page (2-3 sentences, 45-70 words). LEAD with savings intent — coupons, promo codes, offers, deals for this store. Weave in the PRIMARY target keyword and 1-2 high-value variations naturally. Reference real product categories/lines and honest offer TYPES (new-user, first-order, seasonal — hedged, never a fabricated number). India-first (INR, UPI/COD where relevant). This is the deals-first hook, DISTINCT from about_content (which is brand story). Durable — no live discount numbers, no 'sale live now', no literal dates. Plain prose.",
  "about_content": "Original brand story + what they sell + India positioning + why coupons and sale timing matter. No literal dates.",
  "how_to_use_content": "Step-by-step redemption via EndOverPay to the store site, plus 1-2 store-specific caveats.",
  "saving_tips_content": "5-6 store-specific saving tactics: sale timing, first-order/segment offers, marketplace comparison, bank/UPI offers, category-specific tips.",
  "faq_content": [ six {"q","a"} objects covering: how to use the code, are the coupons verified, first-order/new-user discount, biggest sale timing, where else to buy and where it's cheaper, is the brand genuine ],
  "sale_calendar_content": "Intro prose (60-110 words) then table rows. First line is the header exactly: 'Sale Event | Tentative Month | Expected Discount'. Then one line per real recurring India sale event for this store/category, same ' | ' format. See rule 12. Plain text only.",
  "bank_offers_content": "60-100 words on the TYPES of bank/card/UPI offers common for this store or category. Name a bank ONLY if in the facts. No fabricated numbers or live offers. See rule 13.",
  "custom_sections": [ "2 to 5 objects, each {\"heading\", \"content\"}. Category-adaptive sections supported by the brand facts only. Heading includes store name + keyword variant, accurately labels its content, does not duplicate a universal heading. Content is plain prose 70-130 words. See rule 14. If facts support none, return an empty array []." ]
}`

export async function POST(req: NextRequest) {
  const { storeName, websiteUrl, brandFacts, targetKeywords, offerFacts } = await req.json()

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
${targetKeywords && targetKeywords.trim() ? `TARGET KEYWORDS (use these exact, data-driven targets — do NOT invent your own):
${targetKeywords.trim()}

Weave the PRIMARY keyword into the H1 and lead heading. Rotate the HIGH-VALUE variations across section headings and body (never repeat the same phrase twice in a row). Build dedicated sections for SEGMENT long-tails. Turn FAQ SEEDS into FAQ questions. Do NOT target anything in the IGNORE list.` : `Primary keyword: ${s} coupon code
Secondary keywords (weave naturally): ${s} coupons, ${s} offers, ${s} discount code, ${s} promo code, ${s} sale`}
DISCOUNT RULE: No live discount figure is available. Do NOT state any specific percentage or amount anywhere. Use offer-led framing instead. Any invented number is a failure.
DATE RULE: In meta_title and meta_description, write the date as the literal tokens {month} {year}. Use no other dates anywhere.

Brand facts (use as facts, in your own words):
${brandFacts.trim()}

Real coupons/conditions (include only if provided; otherwise write around offers generically):
${offerFacts && offerFacts.trim() ? `
OFFER FACTS — HONESTY GUARDRAIL (follow strictly):
${offerFacts.trim()}

Rules: Only present an offer as a real, specific coupon/discount if it is listed under REAL above. For PUBLIC OFFER items, describe them honestly and generally (no invented codes). For HEDGE items, mention them ONLY in the FAQ with hedged language ("may occasionally offer", "check their site") and NEVER state a specific discount or code. Never fabricate a code, percentage, or amount for any offer not explicitly listed as REAL.` : ''}
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
        max_tokens: 8000,
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

    // v2 sections: coerce to safe shapes (optional fields; never hard-fail on them)
    if (typeof page.sale_calendar_content !== 'string') page.sale_calendar_content = ''
    if (typeof page.bank_offers_content !== 'string') page.bank_offers_content = ''
    if (!Array.isArray(page.custom_sections)) {
      page.custom_sections = []
    } else {
      // keep only well-formed {heading, content} objects with real content
      page.custom_sections = page.custom_sections
        .filter((sec: any) => sec && typeof sec.heading === 'string' && typeof sec.content === 'string'
          && sec.heading.trim() && sec.content.trim())
        .slice(0, 5)
        .map((sec: any) => ({ heading: sec.heading.trim(), content: sec.content.trim() }))
    }

    return NextResponse.json({ page })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 502 })
  }
}
