'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types'

const ICONS = ['👗','📱','🍕','✈️','💄','🏠','🎮','🏥','🛒','💻','📚','🚗','🎵','🌿','💰']
const empty = { name: '', slug: '', icon: '', description: '' }

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('name')
    setCats(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() { setForm(empty); setEditId(null); setShowForm(true) }
  function openEdit(c: Category) {
    setForm({ name: c.name, slug: c.slug, icon: c.icon || '', description: c.description || '' })
    setEditId(c.id); setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Category name required'); return }
    setSaving(true)
    const payload = { ...form, slug: form.slug || slugify(form.name) }
    const { error } = editId
      ? await supabase.from('categories').update(payload).eq('id', editId)
      : await supabase.from('categories').insert(payload)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success(editId ? 'Category updated!' : 'Category added!')
    setShowForm(false); setSaving(false); load()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Deleted'); setDeleteId(null); load()
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">{editId ? 'Edit Category' : 'Add Category'}</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-base">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
                className="input-base" placeholder="e.g. Electronics" />
            </div>
            <div>
              <label className="label-base">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input-base" placeholder="auto-generated" />
            </div>
            <div>
              <label className="label-base">Icon Emoji</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {ICONS.map((ic) => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all ${form.icon === ic ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                    {ic}
                  </button>
                ))}
              </div>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="input-base" placeholder="Or type emoji…" />
            </div>
            <div>
              <label className="label-base">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-base" rows={2} placeholder="Optional description…" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">All Categories <span className="text-gray-400 font-normal text-sm">({cats.length})</span></h3>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {cats.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-xl flex-shrink-0">
                  {c.icon || '🏷️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{c.name}</div>
                  <div className="font-mono text-xs text-gray-400">/{c.slug}</div>
                </div>
                {c.description && <p className="text-xs text-gray-400 flex-1 truncate hidden md:block">{c.description}</p>}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteId(c.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
            {cats.length === 0 && <div className="py-10 text-center text-gray-400 text-sm">No categories yet.</div>}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-5">Coupons in this category won&apos;t be deleted but will become uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
