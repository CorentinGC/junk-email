/**
 * API: Get all addresses history
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { getAllAddresses, getStats } from '#lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    const addresses = getAllAddresses(limit, offset);
    const stats = getStats();
    
    return NextResponse.json({ 
      success: true, 
      data: { addresses, stats } 
    });
  } catch (error) {
    console.error('[API] Error fetching addresses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

