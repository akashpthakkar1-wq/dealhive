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

export default function ContentGenerator({ storeName, category, websiteUrl, form, setForm }: Props) {
  const [generating, setGenerating] = useState<string | null>(null)

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
        setForm((f: any) => ({ ...f, [field]: JSON.stringify(data.faq, null, 2) }))
      } else if (data.content) {
        setForm((f: any) => ({ ...f, [field]: data.content }))
      } else {
        alert('Failed: ' + (data.error || 'Unknown error'))
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

  return (
    <div className="md:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">AI Content Generator</h3>
        <button type="button" onClick={generateAll}
          disabled={!!generating}
          className="text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
          {generating ? `⏳ Generating ${generating}…` : '✨ Generate All Sections'}
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
