import { createServerSupabaseClient } from './supabase-server'
import type { Coupon, Store, Category, BlogPost } from '@/types'

export async function getStores(): Promise<Store[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name')
  if (error) { console.error('getStores:', error); return [] }
  return data || []
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getPopularStores(limit = 12): Promise<Store[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('stores')
    .select('*, coupons(count)')
    .limit(limit)
    .order('name')
  if (error) { console.error('getPopularStores:', error); return [] }
  return data || []
}



export async function getCouponsByCategory(categorySlug: string, excludeStoreId: string, limit = 6): Promise<Coupon[]> {
  const supabase = createServerSupabaseClient()

  // Get store IDs in this category excluding current store
  const { data: stores } = await supabase
    .from('stores')
    .select('id')
    .eq('category', categorySlug)
    .neq('id', excludeStoreId)

  if (!stores || stores.length === 0) return []

  const storeIds = stores.map((s) => s.id)

  const { data, error } = await supabase
    .from('coupons')
    .select('*, store:stores(name, slug, logo, website_url)')
    .in('store_id', storeIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) { console.error('getCouponsByCategory:', error); return [] }
  return data || []
}

export async function getRelatedStores(categorySlug: string, excludeStoreId: string, limit = 5): Promise<Store[]> {
  const supabase = createServerSupabaseClient()
  
  // First try to get stores from same category
  const { data: sameCat } = await supabase
    .from('stores')
    .select('*, coupons(count)')
    .eq('category', categorySlug)
    .neq('id', excludeStoreId)
    .limit(limit)
    .order('name')

  if (sameCat && sameCat.length >= 3) return sameCat

  // Fallback to popular stores if not enough same-category stores
  const { data: popular } = await supabase
    .from('stores')
    .select('*, coupons(count)')
    .neq('id', excludeStoreId)
    .limit(limit)
    .order('name')

  return popular || []
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) { console.error('getCategories:', error); return [] }
  return data || []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getCoupons(options?: {
  storeId?: string
  categoryId?: string
  featured?: boolean
  trending?: boolean
  limit?: number
  excludeExpired?: boolean
}): Promise<Coupon[]> {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('coupons')
    .select('*, store:stores(*), category:categories(*)')
    .order('created_at', { ascending: false })

  if (options?.storeId) query = query.eq('store_id', options.storeId)
  if (options?.categoryId) query = query.eq('category_id', options.categoryId)
  if (options?.featured) query = query.eq('is_featured', true)
  if (options?.trending) query = query.eq('is_trending', true)
  if (options?.excludeExpired) query = query.or(`expiry_date.is.null,expiry_date.gte.${new Date().toISOString()}`)
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) { console.error('getCoupons:', error); return [] }
  return data || []
}

export async function getCouponBySlug(slug: string): Promise<Coupon | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*, store:stores(*), category:categories(*)')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}

export async function getCouponsByStore(storeSlug: string): Promise<Coupon[]> {
  const supabase = createServerSupabaseClient()
  const store = await getStoreBySlug(storeSlug)
  if (!store) return []
  return getCoupons({ storeId: store.id, excludeExpired: false })
}

export async function getTrendingCoupons(limit = 6): Promise<Coupon[]> {
  return getCoupons({ trending: true, excludeExpired: true, limit })
}

export async function getRecentCoupons(limit = 8): Promise<Coupon[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*, store:stores(*), category:categories(*)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data || []
}

export async function getFeaturedCoupons(limit = 8): Promise<Coupon[]> {
  return getCoupons({ featured: true, excludeExpired: true, limit })
}

export async function searchCoupons(query: string): Promise<{ coupons: Coupon[]; stores: Store[] }> {
  const supabase = createServerSupabaseClient()
  const q = `%${query}%`

  const [couponsRes, storesRes] = await Promise.all([
    supabase
      .from('coupons')
      .select('*, store:stores(*), category:categories(*)')
      .or(`title.ilike.${q},description.ilike.${q},code.ilike.${q}`)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('stores')
      .select('*')
      .ilike('name', q)
      .limit(8),
  ])

  return {
    coupons: couponsRes.data || [],
    stores: storesRes.data || [],
  }
}

export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) return []
  return data || []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) return null
  return data
}

export async function getSiteScripts(position?: 'header' | 'footer') {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('site_scripts')
    .select('*')
    .eq('is_active', true)
  if (position) query = query.eq('position', position)
  const { data } = await query
  return data || []
}
