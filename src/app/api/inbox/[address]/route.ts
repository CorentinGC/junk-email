/**
 * API: Get emails for inbox address
 * Accepts either username or full email address
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { getInboxEmails, getInboxAddress, createInboxAddress, deleteAllInboxEmails } from '#lib/emailStorage';
import { isValidEmail, isValidLocalPart } from '#lib/addressGenerator';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: input } = await params;
    
    // If input doesn't contain @, reconstruct full email with SMTP_DOMAIN
    let fullAddress = input;
    if (!input.includes('@')) {
      const domain = process.env.SMTP_DOMAIN || 'localhost';
      fullAddress = `${input}@${domain}`;
    }
    
    if (!isValidEmail(fullAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Get or create inbox if it doesn't exist
    let inbox = await getInboxAddress(fullAddress);
    if (!inbox) {
      // Auto-create inbox if accessed directly via URL
      const localPart = fullAddress.split('@')[0];
      if (!isValidLocalPart(localPart)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }
      
      inbox = await createInboxAddress(fullAddress);
      console.log(`[API] Auto-created inbox: ${fullAddress}`);
    }
    
    const emails = await getInboxEmails(fullAddress);
    
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

/**
 * DELETE /api/inbox/[address]
 * Delete all emails from inbox (keeps address alive)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address: input } = await params;
    
    // If input doesn't contain @, reconstruct full email with SMTP_DOMAIN
    let fullAddress = input;
    if (!input.includes('@')) {
      const domain = process.env.SMTP_DOMAIN || 'localhost';
      fullAddress = `${input}@${domain}`;
    }
    
    const count = await deleteAllInboxEmails(fullAddress);
    
    return NextResponse.json({ 
      success: true, 
      message: `${count} email(s) deleted`,
      count 
    });
  } catch (error) {
    console.error('[API] Error deleting inbox emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete emails' },
      { status: 500 }
    );
  }
}


