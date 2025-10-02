/**
 * API route to serve email attachments
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { getEmail } from '#lib/emailStorage';

/**
 * GET /api/email/[id]/attachment/[filename]
 * Serve email attachment by ID and filename
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id, filename } = await params;
    // Next.js décode automatiquement les params, pas besoin de decodeURIComponent
    
    const email = await getEmail(id);
    
    if (!email) {
      console.error('[API] Email not found:', id);
      return NextResponse.json(
        { success: false, error: 'Email not found' },
        { status: 404 }
      );
    }
    
    console.log('[API] Email attachments:', email.attachments?.map(a => ({ filename: a.filename, hasContent: !!a.content })));
    console.log('[API] Looking for filename:', filename);
    
    const attachment = email.attachments?.find(att => att.filename === filename);
    
    if (!attachment || !attachment.content) {
      console.error('[API] Attachment not found. Available:', email.attachments?.map(a => a.filename));
      return NextResponse.json(
        { success: false, error: 'Attachment not found', available: email.attachments?.map(a => a.filename) },
        { status: 404 }
      );
    }
    
    // Return attachment with proper headers
    return new NextResponse(new Uint8Array(attachment.content), {
      headers: {
        'Content-Type': attachment.contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.filename)}"`,
        'Content-Length': attachment.size.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[API] Error serving attachment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

