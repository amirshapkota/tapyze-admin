import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/admins',
    '/customers',
    '/merchants',
    '/transactions',
    '/nfc-scanners',
    '/rfid-cards'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a protected route and no token exists, redirect to auth
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // If user is authenticated and trying to access auth page, redirect to dashboard
  if (pathname === '/auth' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If accessing root and authenticated, redirect to dashboard
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If accessing root and not authenticated, redirect to auth
  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/auth',
    '/dashboard/:path*',
    '/admins/:path*',
    '/customers/:path*',
    '/merchants/:path*',
    '/transactions/:path*',
    '/nfc-scanners/:path*',
    '/rfid-cards/:path*'
  ]
}