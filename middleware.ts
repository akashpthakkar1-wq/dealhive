import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME  = 'admin_auth'
const COOKIE_VALUE = 'authenticated'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Allow login page through — prevents redirect loop
  if (pathname === '/admin/login') return NextResponse.next()

  // Check auth cookie
  const auth = req.cookies.get(COOKIE_NAME)
  if (auth?.value === COOKIE_VALUE) return NextResponse.next()

  // Not authenticated — redirect to login
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/admin/login'
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*'],
}
