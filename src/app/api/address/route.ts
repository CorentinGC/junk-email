/**
 * API: Generate new disposable email address
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { generateEmailAddress, isValidEmail, getDomain, isValidLocalPart, getLocalPart } from '#lib/addressGenerator';
import { createInboxAddress, getInboxAddress } from '#lib/emailStorage';

export async function POST(request: Request) {
  try {
    const domain = process.env.SMTP_DOMAIN || 'localhost';
    let address: string;
    
    // Check if custom address provided
    const body = await request.json().catch(() => ({}));
    
    if (body.customAddress) {
      const custom = body.customAddress.trim();
      
      // If already contains @, validate full email
      if (custom.includes('@')) {
        if (!isValidEmail(custom)) {
          return NextResponse.json(
            { success: false, error: 'Invalid email format' },
            { status: 400 }
          );
        }
        
        // Validate local part
        const localPart = getLocalPart(custom);
        if (!isValidLocalPart(localPart)) {
          return NextResponse.json(
            { success: false, error: 'Invalid characters in email address. Only letters, numbers, dot, hyphen and underscore allowed.' },
            { status: 400 }
          );
        }
        
        // Check domain matches
        const emailDomain = getDomain(custom);
        if (emailDomain !== domain) {
          return NextResponse.json(
            { success: false, error: `Email must use domain @${domain}` },
            { status: 400 }
          );
        }
        
        address = custom;
      } else {
        // Only local part provided, validate and add domain
        if (!isValidLocalPart(custom)) {
          return NextResponse.json(
            { success: false, error: 'Invalid characters in address. Only letters, numbers, dot, hyphen and underscore allowed.' },
            { status: 400 }
          );
        }
        address = `${custom}@${domain}`;
      }
      
      // Check if already exists
      const existing = await getInboxAddress(address);
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Address already exists' },
          { status: 409 }
        );
      }
    } else {
      // Generate random
      address = generateEmailAddress(domain);
    }
    
    const inbox = await createInboxAddress(address);
    
    return NextResponse.json({ success: true, data: inbox });
  } catch (error) {
    console.error('[API] Error creating address:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create address' },
      { status: 500 }
    );
  }
}


