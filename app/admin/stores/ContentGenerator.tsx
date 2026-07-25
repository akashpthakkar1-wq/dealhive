'use client'
import { useState } from 'react'

interface Props {
  storeName: string
  category: string
  websiteUrl: string
  form: any
  setForm: (f: any) => void
}

const SECTIONS = [
  { key: 'description', label: 'Short Description', field: 'description', rows: 2, hint: '2 sentences shown in store header' },
  { key: 'about', label: 'About Section', field: 'about_content', rows: 4, hint: '150 words about the store' },
  { key: 'how_to_use', label: 'How to Use', field: 'how_to_use_content', rows: 4, hint: 'Step-by-step coupon guide' },
  { key: 'saving_tips', label: 'Saving Tips', field: 'saving_tips_content', rows: 4, hint: '5 store-specific tips' },
  { key: 'faq', label: 'FAQ', field: 'faq_content', rows: 6, hint: '5 store-specific Q&As (JSON)' },
]

const FACT_CATEGORIES = 'origin · what they sell · signature feature · positioning + rivals · trust signals · sale events · where else sold · scale · India availability'

// Flags a literal month-name + 4-digit year in body copy (dates belong only in meta as {month} {year} tokens)
const HARDCODED_DATE = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/i

export default function ContentGenerator({ storeName, category, websiteUrl, form, setForm }: Props) {
  const [generating, setGenerating] = useState<string | null>(null)
  const [fullPageError, setFullPageError] = useState<string | null>(null)

  const brandFacts = form.brand_facts || ''
  const factsTooShort = brandFacts.trim().length < 40

  // Warn if any body field contains a hard-coded date
  const bodyFields = ['about_content', 'how_to_use_content', 'saving_tips_content', 'faq_content']
  const dateWarnFields = bodyFields.filter((f) => HARDCODED_DATE.test(String(form[f] || '')))

  async function generate(section: string, field: string) {
    if (!storeName) return alert('Please enter a store name first')
    setGenerating(section)
    try {
      const res = await fetch('/api/generate-store-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, category, websiteUrl, section }),
      })
      const data = await res.json()
      if (section === 'faq') {
        if (data.faq) {
          setForm((f: any) => ({ ...f, [field]: JSON.stringify(data.faq, null, 2) }))
        } else {
          alert('FAQ generation failed: ' + (data.error || 'Unknown error'))
        }
      } else if (data.content) {
        setForm((f: any) => ({ ...f, [field]: data.content }))
      } else {
        alert('Failed: ' + (data.error || 'Unknown error. Response: ' + JSON.stringify(data)))
      }
    } catch (e) {
      alert('Error generating content')
    } finally {
      setGenerating(null)
    }
  }

  async function generateAll() {
    for (const s of SECTIONS) {
      await generate(s.key, s.field)
    }
  }

  async function generateFullPage() {
    if (!storeName) return alert('Please enter a store name first')
    if (factsTooShort) return
    setFullPageError(null)
    setGenerating('full_page')
    try {
      const res = await fetch('/api/generate-store-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, websiteUrl, brandFacts }),
      })
      const data = await res.json()
      if (!res.ok || !data.page) {
        setFullPageError(data.error || 'Generation failed. ' + JSON.stringify(data))
        return
      }
      const p = data.page
      setForm((f: any) => ({
        ...f,
        meta_title: p.meta_title ?? f.meta_title,
        meta_description: p.meta_description ?? f.meta_description,
        about_content: p.about_content ?? f.about_content,
        how_to_use_content: p.how_to_use_content ?? f.how_to_use_content,
        saving_tips_content: p.saving_tips_content ?? f.saving_tips_content,
        faq_content: p.faq_content ? JSON.stringify(p.faq_content, null, 2) : f.faq_content,
        // h1 intentionally untouched — set manually
        content_reviewed: false,
      }))
    } catch (e) {
      setFullPageError('Error: ' + String(e))
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="md:col-span-2 space-y-4">
      {/* ── Brand Facts → Full Page ───────────────────────────── */}
      <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Brand Facts → Full Page</h3>
          <button type="button" onClick={generateFullPage}
            disabled={!!generating || factsTooShort}
            className="text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {generating === 'full_page' ? '⏳ Generating full page… (20–40s)' : '✨ Generate Full Page'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Enter concrete facts about this store — the more specific, the more unique (and less thin) the page.
          Cover: {FACT_CATEGORIES}.
        </p>
        <textarea
          value={brandFacts}
          onChange={(e) => setForm((f: any) => ({ ...f, brand_facts: e.target.value }))}
          className="input-base"
          rows={10}
          placeholder={`Facts about ${storeName || 'this store'} — origin, what they sell, signature products, how they position vs rivals, sale events, whether they ship to/operate in India, etc.`}
        />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${factsTooShort ? 'text-red-500' : 'text-green-600'}`}>
            {brandFacts.trim().length} chars {factsTooShort ? '(need at least 40 to generate)' : '✓'}
          </span>
          <span className="text-xs text-gray-400">Fills meta, about, how-to, tips & FAQ in one call. Does not touch H1.</span>
        </div>
        {fullPageError && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{fullPageError}</div>
        )}
      </div>

      {dateWarnFields.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-600">
          ⚠️ Hard-coded date found in: {dateWarnFields.join(', ')}. Remove the month/year from body copy — dates belong only in meta title/description as {'{month} {year}'} tokens.
        </div>
      )}

      {/* ── Section-by-section (unchanged) ────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">AI Content Generator</h3>
        <button type="button" onClick={generateAll}
          disabled={!!generating}
          className="text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
          {generating && generating !== 'full_page' ? `⏳ Generating ${generating}…` : '✨ Generate All Sections'}
        </button>
      </div>
      <p className="text-xs text-gray-400">Review and edit each section before saving. AI content should be verified for accuracy.</p>

      {SECTIONS.map((s) => (
        <div key={s.key}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <label className="label-base">{s.label}</label>
              <span className="text-xs text-gray-400 ml-2">{s.hint}</span>
            </div>
            <button type="button"
              onClick={() => generate(s.key, s.field)}
              disabled={!!generating}
              className="text-xs px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 disabled:opacity-50">
              {generating === s.key ? '⏳ Generating…' : '✨ Generate'}
            </button>
          </div>
          <textarea
            value={form[s.field] || ''}
            onChange={(e) => setForm((f: any) => ({ ...f, [s.field]: e.target.value }))}
            className="input-base"
            rows={s.rows}
            placeholder={`Click Generate to create ${s.label}…`}
          />
        </div>
      ))}

      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <span className="text-yellow-600 text-sm">⚠️ Always review AI content before saving — check for accuracy and edit as needed.</span>
      </div>
    </div>
  )
}
