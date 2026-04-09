'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { slugify, formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types'

const emptyForm = { title: '', slug: '', excerpt: '', content: '', cover_image: '', category: '', author: 'DealHive Team', published: false }

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  function f(k: string, v: any) { setForm((p) => ({ ...p, [k]: v })) }
  function openAdd() { setForm(emptyForm); setEditId(null); setShowForm(true) }
  function openEdit(p: BlogPost) {
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', content: p.content || '', cover_image: p.cover_image || '', category: p.category || '', author: p.author || 'DealHive Team', published: p.published })
    setEditId(p.id); setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    const payload = { ...form, slug: form.slug || slugify(form.title) }
    const { error } = editId
      ? await supabase.from('blog_posts').update(payload).eq('id', editId)
      : await supabase.from('blog_posts').insert(payload)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success(editId ? 'Post updated!' : 'Post created!')
    setShowForm(false); setSaving(false); load()
  }

  async function handleDelete(id: string) {
    await supabase.from('blog_posts').delete().eq('id', id)
    toast.success('Post deleted'); setDeleteId(null); load()
  }

  async function togglePublish(post: BlogPost) {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
    toast.success(post.published ? 'Post unpublished' : 'Post published!')
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> New Post</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">{editId ? 'Edit Post' : 'New Blog Post'}</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-base">Title *</label>
              <input value={form.title} onChange={(e) => f('title', e.target.value)}
                className="input-base" placeholder="e.g. 10 Best SHEIN Coupon Codes for April 2025" />
            </div>
            <div>
              <label className="label-base">Slug</label>
              <input value={form.slug} onChange={(e) => f('slug', e.target.value)}
                className="input-base" placeholder="auto-generated" />
            </div>
            <div>
              <label className="label-base">Category</label>
              <input value={form.category} onChange={(e) => f('category', e.target.value)}
                className="input-base" placeholder="e.g. Saving Tips" />
            </div>
            <div>
              <label className="label-base">Author</label>
              <input value={form.author} onChange={(e) => f('author', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="label-base">Cover Image URL</label>
              <input value={form.cover_image} onChange={(e) => f('cover_image', e.target.value)}
                className="input-base" placeholder="https://…" />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => f('excerpt', e.target.value)}
                className="input-base" rows={2} placeholder="Short description shown in listing…" />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Content (HTML or plain text)</label>
              <textarea value={form.content} onChange={(e) => f('content', e.target.value)}
                className="input-base" rows={10} placeholder="Write your blog post here…" />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => f('published', !form.published)}
                  className={`w-10 h-5 rounded-full transition-all relative ${form.published ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: form.published ? '22px' : '2px' }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">Published</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Post'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">All Posts <span className="text-gray-400 font-normal text-sm">({posts.length})</span></h3>
        </div>
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Title', 'Category', 'Author', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="px-5 py-3 max-w-xs">
                      <div className="font-semibold text-gray-900 text-sm truncate">{p.title}</div>
                      <div className="font-mono text-xs text-gray-400">{p.slug}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{p.category || '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{p.author}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(p.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => togglePublish(p)} title={p.published ? 'Unpublish' : 'Publish'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${p.published ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm">No posts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2">Delete Post?</h3>
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
