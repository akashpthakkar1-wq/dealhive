import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'No expiry'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function isExpired(dateString: string | null): boolean {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

export function daysUntilExpiry(dateString: string | null): number | null {
  if (!dateString) return null
  const diff = new Date(dateString).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function maskCode(code: string): string {
  if (!code) return ''
  const show = Math.ceil(code.length * 0.6)
  return code.slice(0, show) + '*'.repeat(code.length - show)
}

export function formatUsageCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

export function getFakeUsageCount(id: string): number {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 100 + (hash % 9000)
}

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'DealHive'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealhive.in'
