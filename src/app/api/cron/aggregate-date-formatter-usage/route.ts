import { NextRequest, NextResponse } from 'next/server';
import { aggregateDateFormatterUsage } from '@/lib/services/date-formatter-usage-aggregator';

/**
 * Cron job endpoint for aggregating date formatter usage
 * Scheduled to run daily via Vercel cron
 * 
 * Security: Requires CRON_SECRET in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Log cron execution start
    console.log('🕐 Cron job started: aggregate-date-formatter-usage');
    const startTime = new Date();
    
    // Run the aggregation
    const result = await aggregateDateFormatterUsage();
    
    // Log cron execution result
    const logData = {
      job: 'aggregate-date-formatter-usage',
      startTime: startTime.toISOString(),
      endTime: new Date().toISOString(),
      success: result.success,
      processedCount: result.processedCount,
      errorCount: result.errorCount,
      duration: result.duration,
      totalRecords: result.totalRecords,
      environment: result.environment,
      error: result.error
    };
    
    if (result.success) {
      console.log('✅ Cron job completed successfully:', logData);
    } else {
      console.error('❌ Cron job failed:', logData);
    }
    
    // Return result for Vercel monitoring
    return NextResponse.json({
      // Note: ok field is required by Vercel cron monitoring system
      ok: result.success,
      success: result.success,
      jobName: 'aggregateDateFormatterUsage',
      timestamp: new Date().toISOString(),
      metrics: {
        recordsProcessed: result.processedCount,
        recordsErrored: result.errorCount,
        executionTimeSeconds: result.duration,
        totalRecordsFound: result.totalRecords,
        environment: result.environment,
        error: result.error || null
      }
    }, { 
      status: result.success ? 200 : 500 
    });
    
  } catch (error) {
    console.error('💥 Unexpected error in cron job:', error);
    
    return NextResponse.json({
      // Note: ok field is required by Vercel cron monitoring system
      ok: false,
      success: false,
      jobName: 'aggregateDateFormatterUsage',
      timestamp: new Date().toISOString(),
      metrics: {
        recordsProcessed: 0,
        recordsErrored: 0,
        executionTimeSeconds: 0,
        totalRecordsFound: 0,
        environment: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { 
      status: 500 
    });
  }
}