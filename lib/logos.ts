/**
 * Central store logo mapping.
 * Uses local /logos/ files — no external Google dependency.
 * Add new stores here as you add them to the database.
 */
const STORE_LOGOS: Record<string, string> = {
  'shein.com':        '/logos/shein.svg',
  'shein.in':         '/logos/shein.svg',
  'myntra.com':       '/logos/myntra.svg',
  'amazon.in':        '/logos/amazon.svg',
  'amazon.com':       '/logos/amazon.svg',
  'flipkart.com':     '/logos/flipkart.svg',
  'swiggy.com':       '/logos/swiggy.svg',
  'zomato.com':       '/logos/zomato.svg',
  'nykaa.com':        '/logos/nykaa.svg',
  'makemytrip.com':   '/logos/makemytrip.svg',
  'aliexpress.com':   '/logos/aliexpress.svg',
  'temu.com':         '/logos/temu.svg',
}

const DEFAULT_LOGO = '/logo.svg'

export function getStoreLogo(url?: string | null): string {
  if (!url) return DEFAULT_LOGO
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return STORE_LOGOS[hostname] || DEFAULT_LOGO
  } catch {
    return DEFAULT_LOGO
  }
}

export function getCouponLogo(coupon: {
  store?: { logo?: string | null; website_url?: string | null } | null
  affiliate_url?: string | null
}): string {
  if (coupon.store?.logo) return coupon.store.logo
  if (coupon.store?.website_url) return getStoreLogo(coupon.store.website_url)
  if (coupon.affiliate_url) return getStoreLogo(coupon.affiliate_url)
  return DEFAULT_LOGO
}
