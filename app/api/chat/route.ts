import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// AI free-text fallback for the chat widget.
// Receives a user message, loads a compact deal catalog, asks Claude to pick
// up to 3 relevant deals, and returns strict JSON: { reply, dealIds, action }.
// The API key stays server-side.
export async function POST(req: NextRequest) {
  let message = ''
  try {
    const body = await req.json()
    message = (body?.message || '').toString().slice(0, 500)
  } catch {
    return NextResponse.json({ reply: "Sorry, I didn't catch that.", dealIds: [], action: 'menu' })
  }

  if (!message.trim()) {
    return NextResponse.json({ reply: 'What are you shopping for today?', dealIds: [], action: 'menu' })
  }

  // Load a compact catalog (active coupons with store names)
  let catalog: any[] = []
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await sb
      .from('coupons')
      .select('id, title, discount, type, store:stores(name, category)')
      .order('is_featured', { ascending: false })
      .limit(60)
    catalog = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      discount: c.discount,
      type: c.type,
      store: c.store?.name || '',
      category: c.store?.category || '',
    }))
  } catch {
    catalog = []
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      reply: "I can help you browse deals! Pick a category or store below.",
      dealIds: [],
      action: 'menu',
    })
  }

  const systemPrompt = `You are a shopping assistant for EndOverPay, an Indian coupon and deals website. You help users find relevant coupon deals from the catalog provided. 
Rules:
- Reply in a short, friendly tone (max 2 sentences).
- Pick up to 3 deal IDs from the catalog that best match the user's request.
- Only use deal IDs that exist in the catalog.
- If nothing matches, return an empty dealIds array and suggest browsing.
- Respond ONLY with valid JSON, no markdown, no preamble.
Output format: {"reply": string, "dealIds": string[], "action": "show_deals" | "show_alerts" | "menu"}
Use "show_alerts" only if the user explicitly asks about deal alerts/notifications. Use "show_deals" when you return deal IDs. Otherwise "menu".`

  const userPrompt = `User message: "${message}"

Deal catalog (JSON):
${JSON.stringify(catalog)}

Return the JSON response now.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ reply: 'Let me show you some options to browse.', dealIds: [], action: 'menu' })
    }

    let text = data.content?.[0]?.text?.trim() || ''
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ reply: text.slice(0, 200) || 'Here are some options to browse.', dealIds: [], action: 'menu' })
    }

    const validIds = new Set(catalog.map((c) => c.id))
    const dealIds = Array.isArray(parsed.dealIds)
      ? parsed.dealIds.filter((id: any) => validIds.has(id)).slice(0, 3)
      : []
    const action = ['show_deals', 'show_alerts', 'menu'].includes(parsed.action) ? parsed.action : 'menu'
    const reply = typeof parsed.reply === 'string' ? parsed.reply.slice(0, 300) : 'Here are some options.'

    return NextResponse.json({ reply, dealIds, action })
  } catch {
    return NextResponse.json({ reply: 'Let me show you some options to browse.', dealIds: [], action: 'menu' })
  }
}
