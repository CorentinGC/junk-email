/**
 * Next.js instrumentation hook for server-side initialization
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize database on server startup
    const { default: db } = await import('#lib/database');
    console.log('[Instrumentation] Database initialized');
    
    // Initialize email storage (Redis connection)
    await import('#lib/emailStorage');
    console.log('[Instrumentation] Email storage initialized');
  }
}

