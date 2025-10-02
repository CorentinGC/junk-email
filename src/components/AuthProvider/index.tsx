/**
 * Auth Provider - Simple wrapper (authentication handled by middleware via cookies)
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

'use client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Authentication is now handled server-side by middleware reading cookies
  // No need for client-side checks or fetch interceptors
  return <>{children}</>;
}

