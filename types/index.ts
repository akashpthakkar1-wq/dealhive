export interface Store {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  website_url: string | null
  category: string | null
  created_at: string
  coupon_count?: number
  about_content?: string | null
  how_to_use_content?: string | null
  saving_tips_content?: string | null
  faq_content?: any | null
  content_reviewed?: boolean
  content_generated_at?: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  faq_content?: any | null
  created_at: string
}

export interface Coupon {
  id: string
  title: string
  description: string | null
  code: string | null
  discount: string | null
  affiliate_url: string
  store_id: string
  category_id: string | null
  expiry_date: string | null
  is_verified: boolean
  type: 'code' | 'deal'
  is_featured: boolean
  is_trending: boolean
  usage_count: number
  min_order_value: string | null
  terms_conditions: string | null
  slug: string
  created_at: string
  store?: Store
  category?: Category
}

export interface Click {
  id: string
  coupon_id: string
  clicked_at: string
  user_agent?: string | null
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string | null
  author: string | null
  published: boolean
  created_at: string
}

export interface SiteScript {
  id: string
  position: 'header' | 'footer'
  content: string
  label: string
  is_active: boolean
  created_at: string
}

export interface SearchResult {
  coupons: Coupon[]
  stores: Store[]
  total: number
}
