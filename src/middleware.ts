/**
 * Middleware for authentication check
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

/**
 * Middleware to protect routes with cookie authentication
 * @param {NextRequest} request - The incoming request
 * @returns {NextResponse} The response
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if APP_PASSWORD is set
  const appPassword = process.env.APP_PASSWORD;
  if (!appPassword) {
    // No password protection configured, allow access
    return NextResponse.next();
  }

  // Get auth cookie
  const authCookie = request.cookies.get('auth_token')?.value;

  if (!authCookie) {
    // No cookie, redirect to login for pages, 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify cookie value matches password
  if (authCookie !== appPassword) {
    // Invalid cookie, redirect to login for pages, 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie valid, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

