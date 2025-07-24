import { NextResponse } from 'next/server';
import { HubSpotInstallationService } from '@/lib/supabase/client';

export async function GET() {
  try {
    const installationService = new HubSpotInstallationService();
    
    // Test basic connection by trying to query the table
    const testHubId = 999999; // Non-existent hub ID for testing
    const result = await installationService.findByHubId(testHubId);
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      tableExists: true,
      result: result // Should be null for non-existent hub ID
    });
    
  } catch (error: any) {
    console.error('Supabase test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Check your Supabase configuration and table schema'
    }, { status: 500 });
  }
}