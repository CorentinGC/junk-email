/**
 * API: Get/Update settings
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import { NextResponse } from 'next/server';
import { getAllSettings, setSetting } from '#lib/database';

export async function GET() {
  try {
    const settings = getAllSettings();
    
    // Ensure email_retention exists (will auto-init via getEmailRetention if needed)
    if (!settings.email_retention) {
      settings.email_retention = '3600';
    }
    
    return NextResponse.json({ 
      success: true, 
      data: settings 
    });
  } catch (error) {
    console.error('[API] Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate email_retention
    if (body.email_retention) {
      const retention = parseInt(body.email_retention, 10);
      if (isNaN(retention) || retention < 60 || retention > 31536000) {
        return NextResponse.json(
          { success: false, error: 'Retention must be between 60 and 31536000 seconds (1 min to 365 days)' },
          { status: 400 }
        );
      }
      setSetting('email_retention', retention.toString());
    }
    
    // Add more settings here if needed
    
    return NextResponse.json({ 
      success: true,
      data: getAllSettings()
    });
  } catch (error) {
    console.error('[API] Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

