/**
 * API: Get or delete specific email
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { getEmail, deleteEmail } from '#lib/emailStorage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = await getEmail(id);
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: email });
  } catch (error) {
    console.error('[API] Error fetching email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteEmail(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete email' },
      { status: 500 }
    );
  }
}


