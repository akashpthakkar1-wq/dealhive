'use client'
import { useState, useRef } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

interface ParsedRow {
  title: string; store_name: string; type: string; discount: string; min_order_value: string; terms_conditions: string;
  code: string; description: string; expiry_date: string; rate: string;
  affiliate_url: string; is_verified: string; is_featured: string; is_trending: string
}

export default function AdminImport() {
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)
  const [exportType, setExportType] = useState<'coupons' | 'stores' | 'all'>('coupons')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function parseCSV(text: string): ParsedRow[] {
    const lines = text.split('\n').filter((l) => l.trim())
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase())
    return lines.slice(1).map((line) => {
      const values = line.match(/(".*?"|[^",\n]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) || []
      const clean = values.map((v) => v.trim().replace(/^"|"$/g, ''))
      return headers.reduce((obj: any, h, i) => { obj[h] = clean[i] || ''; return obj }, {})
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResults(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target?.result as string)
      setParsed(rows)
    }
    reader.readAsText(f)
  }

  async function handleImport() {
    if (!parsed.length) { toast.error('No valid rows to import'); return }
    setImporting(true)
    setResults(null)
    let success = 0
    const errors: string[] = []

    // Get all stores for name→id lookup
    const { data: stores } = await supabase.from('stores').select('id,name')
    const storeMap = new Map((stores || []).map((s: any) => [s.name.toLowerCase(), s.id]))
    const { data: cats } = await supabase.from('categories').select('id,name')
    const catMap = new Map((cats || []).map((c: any) => [c.name.toLowerCase(), c.id]))

    for (const row of parsed) {
      try {
        if (!row.title) { errors.push(`Skipped: missing title`); continue }
        const storeId = storeMap.get((row.store_name || '').toLowerCase()) || null
        const slug = slugify(row.title) + '-' + Math.random().toString(36).slice(2, 6)

        const { error } = await supabase.from('coupons').insert({
          title: row.title,
          slug,
          description: row.description || null,
          code: row.code || null,
          discount: row.discount || null,
          affiliate_url: row.affiliate_url || '#',
          store_id: storeId,
          type: row.type === 'deal' ? 'deal' : 'code',
          expiry_date: row.expiry_date ? new Date(row.expiry_date).toISOString() : null,
          is_verified: row.is_verified !== 'false',
          is_featured: row.is_featured === 'true',
          is_trending: row.is_trending === 'true',
          usage_count: parseInt(row.usage_count) || 0,
          min_order_value: row.min_order_value || null,
          terms_conditions: row.terms_conditions || null,
        })
        if (error) { errors.push(`${row.title}: ${error.message}`); continue }
        success++
      } catch (e: any) {
        errors.push(`${row.title}: ${e.message}`)
      }
    }

    setResults({ success, errors })
    setImporting(false)
    if (success > 0) toast.success(`${success} coupon${success > 1 ? 's' : ''} imported!`)
    if (errors.length > 0) toast.error(`${errors.length} row${errors.length > 1 ? 's' : ''} failed`)
  }

  async function handleExport() {
    const { data: stores } = await supabase.from('stores').select('*')
    const { data: coupons } = await supabase.from('coupons').select('*, store:stores(name)')

    let csv = ''
    let filename = ''

    if (exportType === 'stores') {
      csv = 'name,slug,logo,description,website_url,category\n'
      csv += (stores || []).map((s: any) =>
        `"${s.name}","${s.slug}","${s.logo || ''}","${(s.description || '').replace(/"/g, '""')}","${s.website_url || ''}","${s.category || ''}"`
      ).join('\n')
      filename = 'dealhive_stores.csv'
    } else if (exportType === 'coupons') {
      csv = 'title,store_name,type,discount,code,description,affiliate_url,expiry_date,is_verified,is_featured,is_trending,usage_count,min_order_value,terms_conditions\n'
      csv += (coupons || []).map((c: any) =>
        `"${c.title}","${c.store?.name || ''}","${c.type}","${c.discount || ''}","${c.code || ''}","${(c.description || '').replace(/"/g, '""')}","${c.affiliate_url || ''}","${c.expiry_date ? c.expiry_date.slice(0, 10) : ''}","${c.is_verified}","${c.is_featured}","${c.is_trending}","${c.usage_count}","${(c.min_order_value || '').replace(/"/g, '""')}","${(c.terms_conditions || '').replace(/"/g, '""')}"`
      ).join('\n')
      filename = 'dealhive_coupons.csv'
    } else {
      const all = { stores, coupons }
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dealhive_backup.json'; a.click()
      toast.success('Backup downloaded!')
      return
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click()
    toast.success('Export downloaded!')
  }

  function downloadTemplate() {
    const csv = `title,store_name,type,discount,code,description,affiliate_url,expiry_date,is_verified,is_featured,is_trending,usage_count,min_order_value,terms_conditions
"Flat 70% Off on All Clothing",SHEIN,code,"70% OFF",SHEIN70,"Get flat 70% off on all clothing styles","https://shein.com",2026-12-31,true,true,false,8420,"No minimum order","Valid on 50000+ styles. Cannot be combined with other offers. One use per account."
"Electronics Flash Sale Up to 60% Off",Amazon,deal,"60% OFF",,"Huge discounts on mobiles and laptops","https://amazon.in",2026-12-31,true,false,true,0,"₹999","Valid on selected products only. While stocks last. Discount auto-applied at checkout."`
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dealhive_import_template.csv'; a.click()
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Import section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
          <Upload className="w-5 h-5 text-orange-500" /> Bulk Import Coupons (CSV)
        </h2>
        <p className="text-sm text-gray-500 mb-5">Upload a CSV file to import multiple coupons at once. Store names must match exactly.</p>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-1">{file ? file.name : 'Drop CSV file here or click to browse'}</p>
          <p className="text-xs text-gray-400">{file ? `${parsed.length} rows detected` : 'Supports .csv format · Max 1,000 rows'}</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Template download */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs font-bold text-gray-600 mb-2">📋 Required CSV columns:</p>
          <code className="text-xs text-gray-500 block font-mono leading-relaxed">
            title, store_name, type (code/deal), discount, code, description, affiliate_url, expiry_date (YYYY-MM-DD), is_verified, is_featured, is_trending, usage_count, min_order_value, terms_conditions
          </code>
          <button onClick={downloadTemplate} className="btn-secondary mt-3 text-xs py-1.5 px-3 h-auto">
            <Download className="w-3.5 h-3.5" /> Download Template CSV
          </button>
        </div>

        {/* Preview */}
        {parsed.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-gray-700 mb-3">Preview ({parsed.length} rows)</p>
            <div className="overflow-x-auto max-h-48 overflow-y-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {['Title', 'Store', 'Type', 'Discount', 'Code'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-bold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {parsed.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 max-w-xs truncate font-medium">{row.title}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{row.store_name}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${row.type === 'deal' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                          {row.type || 'code'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-orange-600 font-bold whitespace-nowrap">{row.discount}</td>
                      <td className="px-3 py-2 font-mono text-gray-600 whitespace-nowrap">{row.code || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {parsed.length > 0 && (
          <button onClick={handleImport} disabled={importing} className="btn-primary mt-5">
            {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : <><Upload className="w-4 h-4" /> Import {parsed.length} Coupons</>}
          </button>
        )}

        {/* Results */}
        {results && (
          <div className="mt-5 space-y-3">
            {results.success > 0 && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-700">{results.success} coupon{results.success > 1 ? 's' : ''} imported successfully!</p>
              </div>
            )}
            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-red-700">{results.errors.length} error{results.errors.length > 1 ? 's' : ''}:</p>
                </div>
                <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                  {results.errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-500" /> Export Data
        </h2>
        <p className="text-sm text-gray-500 mb-5">Download your data as CSV or JSON backup.</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label-base">Export Type</label>
            <select value={exportType} onChange={(e) => setExportType(e.target.value as any)} className="input-base w-48">
              <option value="coupons">All Coupons (CSV)</option>
              <option value="stores">All Stores (CSV)</option>
              <option value="all">Full Backup (JSON)</option>
            </select>
          </div>
          <button onClick={handleExport} className="btn-primary h-10">
            <Download className="w-4 h-4" /> Download Export
          </button>
        </div>
      </div>
    </div>
  )
}
