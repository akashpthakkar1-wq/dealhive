import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a senior SEO copywriter for EndOverPay (endoverpay.com), an Indian coupon and deals website. You write CATEGORY pages (e.g. Fashion, Electronics, Food) that group multiple stores. The content must be genuinely useful, original, and stay within Google's helpful-content, thin-content and duplicate-content policies.

Your task: given a category and the REAL stores currently in it, produce original, publish-ready content as a single JSON object.

NON-NEGOTIABLE RULES
1. 100% original wording. Never copy or lightly reword any provided text. Express every fact in your own sentences and structure.
2. Pass the swap test. If a sentence would still read fine after swapping in a different category name, it is too generic — rewrite it so it is unmistakably about THIS category. A Fashion page must never read like an Electronics page. Reference the ACTUAL stores/brands in this category (provided below) as REPRESENTATIVE EXAMPLES ("stores such as...") to make it specific — never as an exhaustive or fixed list, since category membership changes over time. Frame store mentions so the content stays accurate even if stores are later added or removed.
3. Facts only, no fabrication. Never invent discounts, coupon codes, ratings, review counts, dates, or specific numbers. Use offer-led framing ("coupons & deals", "offers") — never a specific percentage or amount. No fabricated trust signals.
4. Humanised, not templated. Vary sentence length and structure. Avoid stock AI phrasing ("in today's fast-paced world", "look no further", "elevate your", "whether you're X or Y", "wide range of products", "one-stop destination"). Write like a knowledgeable Indian shopper-editor.
5. Cover useful intent: what kinds of stores/brands are in this category, what shoppers can save on, and when the best deals tend to appear (seasonal/festive) — from real substance, not padding.
6. India-first. Indian English; prices in INR; reference Indian payment methods (UPI, cards, COD) and Indian sale events (Diwali, End of Season Sale, festive sales) where relevant. Never write copy that would read identically for a US/UK audience.
7. Weave keywords naturally — "[category] coupons", "[category] promo codes", "[category] deals", "[category] offers" — never keyword-stuff or repeat the same phrase back-to-back.
8. Do NOT template across categories. Vary phrasing so two category pages never share identical sentences. The FAQ questions must be rephrased naturally per category, not a fixed reused script.
9. DATES: never write a literal month or year anywhere. Refer to seasons and named sale events instead.
10. PLAIN PROSE ONLY. No markdown or formatting symbols anywhere in field values: no #, ##, **, __, *, -, •, backticks, or markdown links. Flowing sentences and paragraphs only — these render directly as HTML.

LENGTH LIMITS:
- description: 90-130 words, plain prose, no headings.
- faq_content: exactly 5 Q&A pairs; each answer 30-50 words; questions natural and category-specific.

OUTPUT — return ONLY the JSON object. Start with { and end with } — no preamble, no explanation, no markdown code fences. Shape:
{
  "description": "90-130 word original, humanised, India-first category overview that references the real stores/brands in this category and is unmistakably about THIS category.",
  "faq_content": [ five {"q","a"} objects: what stores are in this category, how to use a coupon, when the best deals appear, whether the deals are verified, how to pick the best offer — all category-specific, rephrased naturally ]
}`

export async function POST(req: NextRequest) {
  const { categoryName, stores, existingContent } = await req.json()

  if (!categoryName) {
    return NextResponse.json({ error: 'Category name required' }, { status: 400 })
  }

  const storeList = Array.isArray(stores) && stores.length
    ? stores.join(', ')
    : '(no specific stores provided — keep the overview honest and general, do not invent store names)'

  const enhanceBlock = existingContent && String(existingContent).trim()
    ? `

ENHANCE MODE — the following content already exists for this category and has been reviewed. Treat it as a strong starting point: preserve its tone, structure, and anything that works well, and IMPROVE it — refresh it to reflect the current representative stores above, sharpen specificity, and fix anything generic. Do NOT rewrite it wholesale or discard its strengths; produce an improved version, not an unrelated one. Still obey every rule (original wording, swap test, no fabrication, plain prose, length limits).

EXISTING CONTENT:
${String(existingContent).trim()}
`
    : ''

  const userMessage = `Category: ${categoryName}
Representative stores currently in this category (use as EXAMPLES to make content specific — "such as" — not an exhaustive list; do NOT invent others): ${storeList}

Primary keyword: ${categoryName.toLowerCase()} coupons
Variations to weave naturally: ${categoryName.toLowerCase()} promo codes, ${categoryName.toLowerCase()} deals, ${categoryName.toLowerCase()} offers, ${categoryName.toLowerCase()} discount codes
${enhanceBlock}
Write the category description and FAQ per the rules. Make it unmistakably about ${categoryName}, referencing the real stores above.`

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
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'API error' }, { status: 502 })
    }

    const rawText = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text || '')
      .join('')
      .trim()

    if (!rawText) {
      return NextResponse.json({ error: 'Empty response' }, { status: 502 })
    }

    const cleaned = rawText
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: 'No JSON in response', raw: cleaned.slice(0, 300) }, { status: 502 })
    }

    let parsed
    try {
      parsed = JSON.parse(cleaned.slice(start, end + 1))
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in response', raw: cleaned.slice(0, 300) }, { status: 502 })
    }

    return NextResponse.json({ page: parsed })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Request failed' }, { status: 500 })
  }
}
