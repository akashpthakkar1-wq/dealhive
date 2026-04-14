import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { storeName, category, websiteUrl } = await req.json()

  if (!storeName) {
    return NextResponse.json({ error: 'Store name required' }, { status: 400 })
  }

  const prompt = `You are an expert content writer for a coupon and deals website. Write a unique, helpful store description for "${storeName}" (${category || 'online store'}).

Requirements:
- Write 80-120 words
- Include specific facts about ${storeName} (what they sell, who their customers are, their best known sales/events, unique features)
- Mention their coupon/discount/promo code availability
- Write naturally for real users, not search engines
- Avoid generic phrases like "popular online store", "wide range of products", "competitive prices"
- Include actionable info (best time to shop, loyalty programs, app discounts if applicable)
- Do NOT mention specific prices or percentages unless well-known facts
- Write in third person
- Do not include any headings or bullet points — just a clean paragraph

Only output the description paragraph, nothing else.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    console.log('API response:', JSON.stringify(data))
    const description = data.content?.[0]?.text?.trim()

    if (!description) {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }

    return NextResponse.json({ description })
  } catch (error) {
    return NextResponse.json({ error: 'API error' }, { status: 500 })
  }
}
