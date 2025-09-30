/**
 * API: Get emails for inbox address
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { getInboxEmails, getInboxAddress } from '#lib/emailStorage';
import { isValidEmail } from '#lib/addressGenerator';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!isValidEmail(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    const inbox = await getInboxAddress(address);
    if (!inbox) {
      return NextResponse.json(
        { success: false, error: 'Inbox not found or expired' },
        { status: 404 }
      );
    }
    
    const emails = await getInboxEmails(address);
    
    return NextResponse.json({ 
      success: true, 
      data: { inbox, emails } 
    });
  } catch (error) {
    console.error('[API] Error fetching inbox:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inbox' },
      { status: 500 }
    );
  }
}


