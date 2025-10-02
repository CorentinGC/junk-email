/**
 * API: Delete specific email address
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { deleteInboxAddress } from '#lib/emailStorage';
import { deleteAddress } from '#lib/database';

/**
 * DELETE /api/address/[address]
 * Deletes an address and all its emails (can be recreated later)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address required' },
        { status: 400 }
      );
    }

    // Delete from Redis (address + all emails)
    const deletedEmails = await deleteInboxAddress(address);

    // Delete from SQLite
    const deletedFromDb = deleteAddress(address);

    console.log(`[API] Deleted address ${address} - ${deletedEmails} emails, DB: ${deletedFromDb ? 'deleted' : 'not found'}`);

    return NextResponse.json({
      success: true,
      data: {
        address,
        deletedEmails,
        deletedFromDatabase: deletedFromDb > 0,
      },
    });
  } catch (error) {
    console.error('[API] Error deleting address:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}

