import { NextRequest, NextResponse } from 'next/server';
import { UnifiedUsageAggregator } from '@/lib/shared/services/unified-usage-aggregator';
import { ConfigManager } from '@/lib/config/config-manager';

/**
 * Unified Cron Job Endpoint for Usage Aggregation
 * Aggregates usage data for all apps (date-formatter and url-shortener)
 * 
 * Security: Requires CRON_SECRET in Authorization header
 * 
 * Query Parameters:
 * - full=true: Perform full rebuild (aggregate all historical data)
 * - full=false or omitted: Incremental aggregation (only new data since last run)
 * 
 * Example:
 * - Incremental: GET /api/cron/aggregate-usage
 * - Full rebuild: GET /api/cron/aggregate-usage?full=true
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const config = ConfigManager.getConfig();
    
    if (authHeader !== `Bearer ${config.application.cronSecret}`) {
      console.warn('Unauthorized cron request attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check for full rebuild parameter
    const fullRebuild = request.nextUrl.searchParams.get('full') === 'true';
    
    // Log cron execution start
    const environment = ConfigManager.getCurrentEnvironment();
    console.log(`🕐 Starting unified usage aggregation (${environment.toUpperCase()}) - Full rebuild: ${fullRebuild}`);
    const startTime = new Date();
    
    // Create aggregator and run aggregation
    const aggregator = new UnifiedUsageAggregator();
    const result = await aggregator.aggregateAll(fullRebuild);
    
    // Prepare log data
    const logData = {
      job: 'aggregate-usage',
      environment,
      startTime: startTime.toISOString(),
      endTime: new Date().toISOString(),
      fullRebuild,
      success: result.success,
      summary: result.summary,
      results: result.results
    };
    
    // Log result
    if (result.success) {
      console.log('✅ Unified aggregation completed successfully:', logData);
    } else {
      console.error('❌ Unified aggregation failed:', logData);
    }
    
    // Return response for Vercel monitoring
    return NextResponse.json({
      // Note: ok field is required by Vercel cron monitoring system
      ok: result.success,
      success: result.success,
      jobName: 'aggregateUsage',
      timestamp: new Date().toISOString(),
      fullRebuild,
      environment,
      metrics: result.summary,
      details: result.results
    }, { 
      status: result.success ? 200 : 500 
    });
    
  } catch (error) {
    console.error('💥 Unexpected error in unified aggregation:', error);
    
    return NextResponse.json({
      // Note: ok field is required by Vercel cron monitoring system
      ok: false,
      success: false,
      jobName: 'aggregateUsage',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}