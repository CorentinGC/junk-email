/**
 * API route for login authentication
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * Validates password and sets HTTP-only cookie
 * @param {Request} request - The incoming request
 * @returns {NextResponse} JSON response
 */
export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const expectedPassword = process.env.APP_PASSWORD;

    // If no password is set, deny access
    if (!expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Protection non configurée' },
        { status: 500 }
      );
    }

    // Validate password
    if (password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Create response with success
    const response = NextResponse.json({ success: true });

    // Set secure HTTP-only cookie (7 days validity)
    response.cookies.set('auth_token', expectedPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

