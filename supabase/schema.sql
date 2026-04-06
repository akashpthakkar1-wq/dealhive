-- ============================================================
-- DealHive - Complete Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  icon         TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STORES
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  logo         TEXT,
  description  TEXT,
  website_url  TEXT,
  category     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  code          TEXT,
  discount      TEXT,
  affiliate_url TEXT NOT NULL DEFAULT '#',
  store_id      UUID REFERENCES stores(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  expiry_date   TIMESTAMPTZ,
  is_verified   BOOLEAN DEFAULT TRUE,
  type          TEXT CHECK (type IN ('code','deal')) DEFAULT 'code',
  is_featured   BOOLEAN DEFAULT FALSE,
  is_trending   BOOLEAN DEFAULT FALSE,
  usage_count   INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLICKS
-- ============================================================
CREATE TABLE IF NOT EXISTS clicks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID REFERENCES coupons(id) ON DELETE CASCADE,
  clicked_at  TIMESTAMPTZ DEFAULT NOW(),
  user_agent  TEXT
);

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  excerpt      TEXT,
  content      TEXT,
  cover_image  TEXT,
  category     TEXT,
  author       TEXT DEFAULT 'DealHive Team',
  published    BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SITE SCRIPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS site_scripts (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label      TEXT NOT NULL,
  position   TEXT CHECK (position IN ('header','footer')) DEFAULT 'header',
  content    TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_scripts ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read categories"   ON categories  FOR SELECT USING (true);
CREATE POLICY "Public read stores"       ON stores      FOR SELECT USING (true);
CREATE POLICY "Public read coupons"      ON coupons     FOR SELECT USING (true);
CREATE POLICY "Public read blog posts"   ON blog_posts  FOR SELECT USING (published = true);
CREATE POLICY "Public read scripts"      ON site_scripts FOR SELECT USING (is_active = true);

-- Public insert clicks (tracking)
CREATE POLICY "Public insert clicks" ON clicks FOR INSERT WITH CHECK (true);

-- Service role full access (for admin panel)
CREATE POLICY "Service full categories"   ON categories   FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full stores"       ON stores       FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full coupons"      ON coupons      FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full clicks"       ON clicks       FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full blog_posts"   ON blog_posts   FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full scripts"      ON site_scripts FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_coupons_store_id   ON coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_category   ON coupons(category_id);
CREATE INDEX IF NOT EXISTS idx_coupons_trending   ON coupons(is_trending);
CREATE INDEX IF NOT EXISTS idx_coupons_featured   ON coupons(is_featured);
CREATE INDEX IF NOT EXISTS idx_coupons_slug       ON coupons(slug);
CREATE INDEX IF NOT EXISTS idx_stores_slug        ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_clicks_coupon      ON clicks(coupon_id);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO categories (name, slug, icon) VALUES
  ('Fashion',      'fashion',     '👗'),
  ('Electronics',  'electronics', '📱'),
  ('Food',         'food',        '🍕'),
  ('Travel',       'travel',      '✈️'),
  ('Beauty',       'beauty',      '💄'),
  ('Home',         'home',        '🏠'),
  ('Gaming',       'gaming',      '🎮'),
  ('Health',       'health',      '🏥')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO stores (name, slug, logo, description, website_url, category) VALUES
  ('SHEIN',       'shein',     'https://logo.clearbit.com/shein.com',     'Global fashion brand with trending styles.', 'https://shein.com',     'Fashion'),
  ('Myntra',      'myntra',    'https://logo.clearbit.com/myntra.com',    'India''s top fashion platform.',             'https://myntra.com',    'Fashion'),
  ('Amazon',      'amazon',    'https://logo.clearbit.com/amazon.in',     'Everything store with daily deals.',         'https://amazon.in',     'Electronics'),
  ('Flipkart',    'flipkart',  'https://logo.clearbit.com/flipkart.com',  'Big Billion Days & daily offers.',           'https://flipkart.com',  'Electronics'),
  ('Swiggy',      'swiggy',    'https://logo.clearbit.com/swiggy.com',    'Food delivery from top restaurants.',        'https://swiggy.com',    'Food'),
  ('Nykaa',       'nykaa',     'https://logo.clearbit.com/nykaa.com',     'India''s largest beauty platform.',          'https://nykaa.com',     'Beauty'),
  ('Zomato',      'zomato',    'https://logo.clearbit.com/zomato.com',    'Food delivery & dining out.',                'https://zomato.com',    'Food'),
  ('MakeMyTrip',  'makemytrip','https://logo.clearbit.com/makemytrip.com','Flights, hotels & holiday packages.',        'https://makemytrip.com','Travel')
ON CONFLICT (slug) DO NOTHING;

-- Insert coupons (using store IDs from above)
DO $$
DECLARE
  shein_id    UUID;
  myntra_id   UUID;
  amazon_id   UUID;
  swiggy_id   UUID;
  nykaa_id    UUID;
  fashion_id  UUID;
  elec_id     UUID;
  food_id     UUID;
  beauty_id   UUID;
BEGIN
  SELECT id INTO shein_id   FROM stores WHERE slug = 'shein';
  SELECT id INTO myntra_id  FROM stores WHERE slug = 'myntra';
  SELECT id INTO amazon_id  FROM stores WHERE slug = 'amazon';
  SELECT id INTO swiggy_id  FROM stores WHERE slug = 'swiggy';
  SELECT id INTO nykaa_id   FROM stores WHERE slug = 'nykaa';
  SELECT id INTO fashion_id FROM categories WHERE slug = 'fashion';
  SELECT id INTO elec_id    FROM categories WHERE slug = 'electronics';
  SELECT id INTO food_id    FROM categories WHERE slug = 'food';
  SELECT id INTO beauty_id  FROM categories WHERE slug = 'beauty';

  INSERT INTO coupons (title, slug, description, code, discount, affiliate_url, store_id, category_id, expiry_date, is_verified, type, is_featured, is_trending, usage_count) VALUES
    ('Flat 70% Off on All Clothing & Accessories','shein-70-off-clothing','No minimum order. Valid on 50,000+ styles.','SHEIN70','70% OFF','https://shein.com',shein_id,fashion_id,NOW() + INTERVAL '30 days',true,'code',true,true,8420),
    ('₹500 Off First Order – New Users Only','shein-500-new-user','Welcome offer. Min. cart ₹1499. One-time use.','SHEIN500','₹500 OFF','https://shein.com',shein_id,fashion_id,NOW() + INTERVAL '60 days',true,'code',true,false,21000),
    ('Summer Flash Sale – Up to 90% Off','shein-summer-flash-sale','Massive summer clearance. Auto-applied.','','90% OFF','https://shein.com',shein_id,fashion_id,NOW() + INTERVAL '7 days',true,'deal',true,true,45000),
    ('Extra 50% Off Sitewide – All Fashion','myntra-extra-50-off','Extra 50% off already discounted prices.','MYN50','50% OFF','https://myntra.com',myntra_id,fashion_id,NOW() + INTERVAL '25 days',true,'code',true,true,5210),
    ('Electronics Sale – Up to 60% Off','amazon-electronics-60','Huge discounts on mobiles, laptops, TVs.','','60% OFF','https://amazon.in',amazon_id,elec_id,NOW() + INTERVAL '10 days',true,'deal',true,true,32000),
    ('60% Off + Free Delivery on First 5 Orders','swiggy-60-off-new','New user offer. Valid all restaurants.','SWIG60','60% OFF','https://swiggy.com',swiggy_id,food_id,NOW() + INTERVAL '20 days',true,'code',true,false,12300),
    ('₹300 Off on Orders Above ₹999','nykaa-300-off','Valid on beauty, skincare, haircare.','NYK300','₹300 OFF','https://nykaa.com',nykaa_id,beauty_id,NOW() + INTERVAL '28 days',true,'code',false,false,3670)
  ON CONFLICT (slug) DO NOTHING;
END;
$$;
