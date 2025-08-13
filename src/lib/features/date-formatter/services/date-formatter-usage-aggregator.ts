/**
 * Date Formatter Usage Aggregator Service
 * Aggregates usage data from usage_requests into portal_usage_monthly
 * Designed for daily cron job execution
 */

import { supabaseAdmin } from '@/lib/database/supabase';
import { ConfigManager } from '@/lib/config/config-manager';

interface AggregationStats {
  portalId: number;
  monthYear: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
}

interface AggregationResult {
  success: boolean;
  processedCount: number;
  errorCount: number;
  duration: number;
  totalRecords: number;
  environment: string;
  error?: string;
}


/**
 * Aggregates date formatter usage data from raw requests to monthly summaries
 * Processes all historical data and updates portal_usage_monthly table
 */
export async function aggregateDateFormatterUsage(): Promise<AggregationResult> {
  const startTime = new Date();
  let environment = 'dev'; // Default fallback
  
  try {
    environment = ConfigManager.getCurrentEnvironment();
    console.log(`🔄 Starting usage aggregation (${environment.toUpperCase()}) at ${startTime.toISOString()}`);
    console.log('⚠️  WARNING: Fetching ALL historical data - optimize for production use');

    // PERFORMANCE WARNING: This fetches ALL historical data from usage_requests table
    // and processes it on the client side. This approach may cause high network traffic
    // and memory usage as the dataset grows larger over time.
    //
    // TODO: Optimize this in the future by:
    // 1. Adding a 'processed' flag to usage_requests table to track aggregated records
    // 2. Only fetching records where processed = false
    // 3. Using database-side aggregation with custom SQL functions
    // 4. Implementing incremental aggregation (only new data since last run)
    // 5. Adding pagination for very large datasets
    
    const { data: rawData, error: fetchError } = await supabaseAdmin
      .from('usage_requests')
      .select('portal_id, month_year, success');

    if (fetchError) {
      throw new Error(`Failed to fetch usage requests: ${fetchError.message}`);
    }

    if (!rawData || rawData.length === 0) {
      console.log('✅ No requests to aggregate');
      return {
        success: true,
        processedCount: 0,
        errorCount: 0,
        duration: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
        totalRecords: 0,
        environment
      };
    }

    // Efficient client-side grouping
    const aggregationMap = new Map<string, AggregationStats>();
    rawData.forEach(request => {
      const key = `${request.portal_id}:${request.month_year}`;
      const current = aggregationMap.get(key) || {
        portalId: request.portal_id,
        monthYear: request.month_year,
        requestCount: 0,
        successCount: 0,
        errorCount: 0
      };
      
      current.requestCount++;
      if (request.success) {
        current.successCount++;
      } else {
        current.errorCount++;
      }
      
      aggregationMap.set(key, current);
    });

    const aggregatedResults = Array.from(aggregationMap.values());
    console.log(`📊 Processing ${rawData.length} requests into ${aggregatedResults.length} portal-month combinations`);
    
    let processedCount = 0;
    let errorCount = 0;

    for (const stats of aggregatedResults) {
      const key = `${stats.portalId}:${stats.monthYear}`;
      try {
        // Direct upsert using Supabase client
        const { error: upsertError } = await supabaseAdmin
          .from('portal_usage_monthly')
          .upsert({
            portal_id: stats.portalId,
            month_year: stats.monthYear,
            request_count: stats.requestCount,
            success_count: stats.successCount,
            error_count: stats.errorCount,
            last_request_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'portal_id,month_year'
          });

        if (upsertError) {
          throw new Error(`Upsert failed for ${key}: ${upsertError.message}`);
        }

        processedCount++;

      } catch (error) {
        console.error(`❌ Error processing ${key}:`, error instanceof Error ? error.message : 'Unknown error');
        errorCount++;
      }
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    console.log(`✅ Aggregation completed: ${processedCount} processed, ${errorCount} errors, ${duration}s`);

    return {
      success: true,
      processedCount,
      errorCount,
      duration,
      totalRecords: rawData.length,
      environment
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Fatal error during usage aggregation:', errorMessage);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    return {
      success: false,
      processedCount: 0,
      errorCount: 0,
      duration: Math.round((new Date().getTime() - startTime.getTime()) / 1000),
      totalRecords: 0,
      environment,
      error: errorMessage
    };
  }
}