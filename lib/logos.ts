
const DEFAULT_LOGO = '/logo.svg'

export function getStoreLogo(url?: string | null): string {
  if (!url) return DEFAULT_LOGO
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`
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
