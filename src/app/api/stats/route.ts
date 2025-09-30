/**
 * API: Get statistics
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { getStats } from '#lib/database';

export async function GET() {
  try {
    const stats = getStats();
    
    return NextResponse.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('[API] Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

