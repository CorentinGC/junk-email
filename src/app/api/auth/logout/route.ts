/**
 * API route for logout
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears authentication cookie
 * @returns {NextResponse} JSON response
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear auth cookie
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Immediate expiration
    path: '/',
  });

  return response;
}

