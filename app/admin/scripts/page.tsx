'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Save, Code2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import type { SiteScript } from '@/types'

const emptyForm = { label: '', position: 'header' as 'header' | 'footer', content: '', is_active: true }

export default function AdminScripts() {
  const [scripts, setScripts] = useState<SiteScript[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('site_scripts').select('*').order('created_at', { ascending: false })
    setScripts(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!form.label.trim()) { toast.error('Label required'); return }
    if (!form.content.trim()) { toast.error('Script content required'); return }
    setSaving(true)
    const { error } = await supabase.from('site_scripts').insert(form)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Script saved!')
    setShowForm(false); setSaving(false); load()
  }

  async function handleDelete(id: string) {
    await supabase.from('site_scripts').delete().eq('id', id)
    toast.success('Script deleted'); load()
  }

  async function toggleActive(s: SiteScript) {
    await supabase.from('site_scripts').update({ is_active: !s.is_active }).eq('id', s.id)
    toast.success(s.is_active ? 'Script disabled' : 'Script enabled')
    load()
  }

  const header = scripts.filter((s) => s.position === 'header')
  const footer = scripts.filter((s) => s.position === 'footer')

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-bold mb-1">How Script Injection Works</p>
          <p><strong>Header scripts</strong> are injected inside <code className="bg-blue-100 px-1 rounded">&lt;head&gt;</code> — use for Google Analytics, Meta Pixel, Google Tag Manager.</p>
          <p className="mt-1"><strong>Footer scripts</strong> are injected before <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> — use for chat widgets, Hotjar, etc.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Script</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Add Script</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">Label / Name *</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="input-base" placeholder="e.g. Google Analytics GA4" />
            </div>
            <div>
              <label className="label-base">Position</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as any })} className="input-base">
                <option value="header">Header (inside &lt;head&gt;)</option>
                <option value="footer">Footer (before &lt;/body&gt;)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Script Content</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="input-base font-mono text-xs" rows={10}
                placeholder={'<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag(\'js\', new Date());\n  gtag(\'config\', \'G-XXXXXXXX\');\n</script>'} />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`w-10 h-5 rounded-full transition-all relative ${form.is_active ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: form.is_active ? '22px' : '2px' }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Active (inject immediately)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Script'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Header scripts */}
      <div>
        <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-500" /> Header Scripts ({header.length})
        </h3>
        <ScriptList scripts={header} onDelete={handleDelete} onToggle={toggleActive} />
      </div>

      {/* Footer scripts */}
      <div>
        <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-purple-500" /> Footer Scripts ({footer.length})
        </h3>
        <ScriptList scripts={footer} onDelete={handleDelete} onToggle={toggleActive} />
      </div>
    </div>
  )
}

function ScriptList({ scripts, onDelete, onToggle }: { scripts: SiteScript[]; onDelete: (id: string) => void; onToggle: (s: SiteScript) => void }) {
  if (!scripts.length) {
    return <div className="bg-white rounded-xl border border-gray-100 py-8 text-center text-gray-400 text-sm">No scripts added yet.</div>
  }
  return (
    <div className="space-y-3">
      {scripts.map((s) => (
        <div key={s.id} className={`bg-white rounded-xl border shadow-sm p-4 ${s.is_active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="font-bold text-gray-900 text-sm">{s.label}</div>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.position === 'header' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {s.position === 'header' ? '↑ Header' : '↓ Footer'}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {s.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onToggle(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${s.is_active ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}>
                {s.is_active ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => onDelete(s.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <pre className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 overflow-x-auto max-h-32 font-mono leading-relaxed">
            {s.content.slice(0, 500)}{s.content.length > 500 ? '\n…(truncated)' : ''}
          </pre>
        </div>
      ))}
    </div>
  )
}
