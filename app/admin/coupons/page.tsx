'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save, Search, Filter, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { slugify, formatDate, isExpired } from '@/lib/utils'
import type { Coupon, Store, Category } from '@/types'

const emptyForm = {
  title: '', slug: '', description: '', code: '', discount: '',
  affiliate_url: '', store_id: '', category_id: '', expiry_date: '',
  min_order_value: '', terms_conditions: '',
  is_verified: true, type: 'code' as 'code' | 'deal',
  is_featured: false, is_trending: false, usage_count: 0,
  deal_of_the_day_order: null as number | null,
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStore, setFilterStore] = useState('')
  const [filterType, setFilterType] = useState('')
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const [cRes, sRes, catRes] = await Promise.all([
      supabase.from('coupons').select('*, store:stores(name,slug), category:categories(name)').order('created_at', { ascending: false }),
      supabase.from('stores').select('id,name').order('name'),
      supabase.from('categories').select('id,name').order('name'),
    ])
    setCoupons(cRes.data || [])
    setStores((sRes.data || []) as any)
    setCategories((catRes.data || []) as any)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function f(key: string, val: any) { setForm((p) => ({ ...p, [key]: val })) }

  function openAdd() { setForm(emptyForm); setEditId(null); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function openEdit(c: Coupon) {
    setForm({
      title: c.title, slug: c.slug, description: c.description || '', code: c.code || '',
      discount: c.discount || '', affiliate_url: c.affiliate_url, store_id: c.store_id || '',
      category_id: c.category_id || '', expiry_date: c.expiry_date ? c.expiry_date.slice(0, 10) : '',
      min_order_value: c.min_order_value || '', terms_conditions: c.terms_conditions || '',
      is_verified: c.is_verified, type: c.type, is_featured: c.is_featured,
      is_trending: c.is_trending, usage_count: c.usage_count,
      deal_of_the_day_order: (c as any).deal_of_the_day_order ?? null,
    })
    setEditId(c.id); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.affiliate_url.trim()) { toast.error('Affiliate URL is required'); return }
    setSaving(true)
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      code: form.type === 'deal' ? null : (form.code || null),
      expiry_date: form.expiry_date || null,
      min_order_value: form.min_order_value || null,
      terms_conditions: form.terms_conditions || null,
      store_id: form.store_id || null,
      category_id: form.category_id || null,
      deal_of_the_day_order: (form as any).deal_of_the_day_order ?? null,
    }
    const { error } = editId
      ? await supabase.from('coupons').update(payload).eq('id', editId)
      : await supabase.from('coupons').insert(payload)
    if (error) { toast.error(error.message || error.details || 'Save failed'); console.error('Save error:', error); setSaving(false); return }
    toast.success(editId ? 'Coupon updated!' : 'Coupon added!')
    // Revalidate the store page cache so changes appear immediately
    const storeObj = stores?.find((s: any) => s.id === form.store_id)
    if (storeObj?.slug) {
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': 'endoverpay_revalidate_2026' },
        body: JSON.stringify({ storeSlug: storeObj.slug, tag: 'coupons' })
      }).catch(() => {})
    }
    setShowForm(false); setEditId(null); setSaving(false); load()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Deleted'); setDeleteId(null); load()
  }

  const filtered = coupons.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.code || '').toLowerCase().includes(search.toLowerCase())
    const matchStore = !filterStore || c.store_id === filterStore
    const matchType = !filterType || c.type === filterType
    return matchSearch && matchStore && matchType
  })

  return (
    <div className="space-y-5">
      {/* Top controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupons…" className="input-base pl-9 w-56" />
          </div>
          <select value={filterStore} onChange={(e) => setFilterStore(e.target.value)} className="input-base w-44">
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-base w-36">
            <option value="">All Types</option>
            <option value="code">Code</option>
            <option value="deal">Deal</option>
          </select>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Coupon</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 text-base">{editId ? 'Edit Coupon' : 'Add New Coupon / Deal'}</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-base">Title *</label>
              <input value={form.title} onChange={(e) => f('title', e.target.value)}
                className="input-base" placeholder="e.g. Flat 70% Off on All Clothing" />
            </div>
            <div>
              <label className="label-base">Slug</label>
              <input value={form.slug} onChange={(e) => f('slug', e.target.value)}
                className="input-base" placeholder="auto-generated from title" />
            </div>
            <div>
              <label className="label-base">Type</label>
              <select value={form.type} onChange={(e) => f('type', e.target.value)} className="input-base">
                <option value="code">Coupon Code</option>
                <option value="deal">Deal (No Code)</option>
              </select>
            </div>
            {form.type === 'code' && (
              <div>
                <label className="label-base">Coupon Code</label>
                <input value={form.code} onChange={(e) => f('code', e.target.value.toUpperCase())}
                  className="input-base font-mono uppercase" placeholder="e.g. SAVE70" />
              </div>
            )}
            <div>
              <label className="label-base">Discount</label>
              <input value={form.discount} onChange={(e) => f('discount', e.target.value)}
                className="input-base" placeholder="e.g. 70% OFF or ₹500 OFF" />
            </div>
            <div>
              <label className="label-base">Store</label>
              <select value={form.store_id} onChange={(e) => f('store_id', e.target.value)} className="input-base">
                <option value="">Select store…</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base">Category</label>
              <select value={form.category_id} onChange={(e) => f('category_id', e.target.value)} className="input-base">
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Affiliate URL *</label>
              <input value={form.affiliate_url} onChange={(e) => f('affiliate_url', e.target.value)}
                className="input-base" placeholder="https://affiliate.link/…" />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Description</label>
              <textarea value={form.description} onChange={(e) => f('description', e.target.value)}
                className="input-base" rows={2} placeholder="What does this coupon offer?" />
            </div>
            <div>
              <label className="label-base">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={(e) => f('expiry_date', e.target.value)} className="input-base" />
              <label className="label-base mt-3">Min. Order Value <span className="text-gray-400 font-normal text-xs">(optional — e.g. ₹499 or $9.90)</span></label>
              <input type="text" value={form.min_order_value} onChange={(e) => f('min_order_value', e.target.value)} className="input-base" placeholder="e.g. ₹499" />
              <label className="label-base mt-3">Terms & Conditions <span className="text-gray-400 font-normal text-xs">(shown in Show Details & popup)</span></label>
              <textarea value={form.terms_conditions} onChange={(e) => f('terms_conditions', e.target.value)}
                className="input-base" rows={4} placeholder="e.g. Valid on all categories. Cannot be combined with bank offers. One use per account." />
            </div>
            <div>
              <label className="label-base">Usage Count (fake/real)</label>
              <input type="number" value={form.usage_count} onChange={(e) => f('usage_count', parseInt(e.target.value) || 0)} className="input-base" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">
            {[
              { key: 'is_verified', label: 'Verified', color: 'green' },
              { key: 'is_featured', label: 'Featured', color: 'yellow' },
              { key: 'is_trending', label: 'Trending', color: 'red' },
            ].map(({ key, label, color }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => f(key, !(form as any)[key])}
                  className={`w-10 h-5 rounded-full transition-all relative ${(form as any)[key] ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(form as any)[key] ? 'left-5.5' : 'left-0.5'}`} style={{ left: (form as any)[key] ? '22px' : '2px' }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </label>
            ))}
            {/* Deal of the Day slot selector */}
            <div className="flex items-center gap-3 pl-2 border-l-2 border-orange-300">
              <div>
                <div className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>⚡</span> Deal of the Day
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Slot 1=Mon · 2=Tue · 3=Wed · 4=Thu · 5=Fri · 6=Sat · 7=Sun</div>
              </div>
              <select
                value={(form as any).deal_of_the_day_order ?? ''}
                onChange={(e) => f('deal_of_the_day_order', e.target.value ? parseInt(e.target.value) : null)}
                className="input-base w-32 ml-2"
              >
                <option value="">Not set</option>
                {[1,2,3,4,5,6,7].map(n => (
                  <option key={n} value={n}>Slot {n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Coupon'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Stats mini */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', val: coupons.length, bg: 'bg-orange-50 text-orange-700' },
          { label: 'Active', val: coupons.filter((c) => !isExpired(c.expiry_date)).length, bg: 'bg-green-50 text-green-700' },
          { label: 'Codes', val: coupons.filter((c) => c.type === 'code').length, bg: 'bg-blue-50 text-blue-700' },
          { label: 'Deals', val: coupons.filter((c) => c.type === 'deal').length, bg: 'bg-purple-50 text-purple-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${s.bg} border border-current/10`}>
            <div className="text-2xl font-extrabold">{s.val}</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-0.5 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Coupons & Deals <span className="text-gray-400 font-normal text-sm">({filtered.length})</span></h3>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Title', 'Store', 'Type', 'Code', 'Discount', 'Expiry', 'Flags', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => {
                  const exp = isExpired(c.expiry_date)
                  return (
                    <tr key={c.id} className={`hover:bg-orange-50/20 transition-colors ${exp ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-gray-900 text-sm truncate">{c.title}</div>
                        {exp && <span className="text-xs text-red-500 font-medium">Expired</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{(c.store as any)?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.type === 'code' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {c.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-orange-600 font-bold whitespace-nowrap">{c.code || '—'}</td>
                      <td className="px-4 py-3">
                        {c.discount && <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">{c.discount}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{c.expiry_date ? formatDate(c.expiry_date) : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {c.is_verified && <span title="Verified" className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</span>}
                          {c.is_featured && <span title="Featured" className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center text-xs">⭐</span>}
                          {c.is_trending && <span title="Trending" className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-xs">🔥</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteId(c.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No coupons found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2">Delete Coupon?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-red-600">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
