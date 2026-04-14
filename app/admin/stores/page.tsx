'use client'
import ContentGenerator from './ContentGenerator'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save, Search, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Store as StoreType } from '@/types'

const empty = { name: '', slug: '', logo: '', description: '', website_url: '', category: '', about_content: '', how_to_use_content: '', saving_tips_content: '', faq_content: '', content_reviewed: false }
const cats = ['Fashion', 'Electronics', 'Food', 'Travel', 'Beauty', 'Home', 'Gaming', 'Health', 'Other']

export default function AdminStores() {
  const [stores, setStores] = useState<StoreType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('stores').select('*').order('name')
    setStores(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() { setForm(empty); setEditId(null); setShowForm(true) }
  function openEdit(s: StoreType) {
    setForm({ name: s.name, slug: s.slug, logo: s.logo || '', description: s.description || '', website_url: s.website_url || '', category: s.category || '', about_content: s.about_content || '', how_to_use_content: s.how_to_use_content || '', saving_tips_content: s.saving_tips_content || '', faq_content: s.faq_content ? JSON.stringify(s.faq_content, null, 2) : '', content_reviewed: s.content_reviewed || false })
    setEditId(s.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Store name is required'); return }
    setSaving(true)
    const payload = { ...form, slug: form.slug || slugify(form.name) }
    const { error } = editId
      ? await supabase.from('stores').update(payload).eq('id', editId)
      : await supabase.from('stores').insert(payload)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success(editId ? 'Store updated!' : 'Store added!')
    setShowForm(false); setEditId(null); setSaving(false)
    load()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('stores').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Store deleted')
    setDeleteId(null); load()
  }

  const filtered = stores.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores…" className="input-base pl-9 w-64" />
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Store
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 text-base">{editId ? 'Edit Store' : 'Add New Store'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">Store Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                className="input-base" placeholder="e.g. Amazon India" />
            </div>
            <div>
              <label className="label-base">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input-base" placeholder="auto-generated" />
            </div>
            <div>
              <label className="label-base">Logo URL</label>
              <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })}
                className="input-base" placeholder="https://logo.clearbit.com/amazon.in" />
              <p className="text-xs text-gray-400 mt-1">Tip: use https://logo.clearbit.com/domain.com</p>
            </div>
            <div>
              <label className="label-base">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-base">
                <option value="">Select category…</option>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base">Website URL</label>
              <input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                className="input-base" placeholder="https://amazon.in" />
            </div>
            <ContentGenerator
              storeName={form.name}
              category={form.category}
              websiteUrl={form.website_url}
              form={form}
              setForm={setForm}
            />
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Store'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">All Stores <span className="text-gray-400 font-normal text-sm">({filtered.length})</span></h3>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Store', 'Category', 'Website', 'Slug', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {s.logo ? (
                          <img src={s.logo} alt={`${s.name} logo`} className="w-8 h-8 rounded-lg object-contain border border-gray-100 bg-white" onError={(e: any) => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><Store className="w-4 h-4 text-orange-400" /></div>
                        )}
                        <span className="font-semibold text-gray-900 text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">{s.category || '—'}</span></td>
                    <td className="px-5 py-3"><a href={s.website_url || '#'} target="_blank" className="text-xs text-blue-500 hover:underline truncate max-w-[120px] block">{s.website_url?.replace('https://', '') || '—'}</a></td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{s.slug}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(s.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">No stores found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Store?</h3>
            <p className="text-gray-500 text-sm mb-5">This will also remove all associated coupons. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
