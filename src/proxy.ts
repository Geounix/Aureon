import { NextRequest, NextResponse } from 'next/server'

// Proxy (Next.js 16 replacement for middleware) - always runs on Node.js
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't need auth check
  const publicPaths = ['/login', '/register', '/api/auth', '/_next', '/favicon']
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  if (isPublic) {
    return NextResponse.next()
  }

  // Check for session cookie set by next-auth
  const sessionToken =
    request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token')

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
