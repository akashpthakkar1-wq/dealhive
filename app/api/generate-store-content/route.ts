import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { storeName, category, websiteUrl, section } = await req.json()

  if (!storeName) {
    return NextResponse.json({ error: 'Store name required' }, { status: 400 })
  }

  const prompts: Record<string, string> = {
    description: `Write a 2-sentence description of ${storeName} (${category || 'online store'}) for a coupon website. Mention what they sell and their best feature. Natural, user-friendly tone. No generic phrases like "popular online store" or "wide range of products". Output only the 2 sentences, nothing else.`,

    about: `Write a 150-word "About" section for ${storeName} (${category || 'online store'}) for a coupon website. Cover: what they specialize in, their most famous sale events, why customers trust them, unique features like loyalty program or app discounts. Write naturally for real users. No bullet points, just paragraphs. No generic phrases. Output only the content, nothing else.`,

    how_to_use: `Write a step-by-step guide (100-150 words) for using ${storeName} coupon codes at checkout. Cover: where to find the promo code box on ${storeName}, exact checkout steps, common issues (code not working, expired), tips for applying codes. Write naturally for real users. No generic steps. Output only the content, nothing else.`,

    saving_tips: `Write 5 specific money-saving tips (100-150 words total) for shopping at ${storeName}. Cover: their loyalty/rewards program, app-exclusive discounts, best time of year to shop, price match/return policies, lesser-known discount methods. Be specific to ${storeName}, not generic. Output only the tips as a short paragraph, nothing else.`,

    faq: `Write exactly 5 FAQs that users search for about ${storeName} coupon codes. Make questions store-specific and answers accurate and helpful. Format as JSON array like: [{"q":"question here","a":"answer here"}]. Output only the JSON array, nothing else.`,
  }

  const prompt = section ? prompts[section] : prompts.description

  if (!prompt) {
    return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'API error' }, { status: 500 })
    }

    const content = data.content?.[0]?.text?.trim()

    if (!content) {
      return NextResponse.json({ error: 'Empty response' }, { status: 500 })
    }

    // Parse FAQ as JSON
    if (section === 'faq') {
      try {
        const faq = JSON.parse(content)
        return NextResponse.json({ faq })
      } catch {
        return NextResponse.json({ error: 'Invalid FAQ format' }, { status: 500 })
      }
    }

    return NextResponse.json({ content })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
