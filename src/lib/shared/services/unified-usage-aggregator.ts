/**
 * Unified Usage Aggregator Service
 * Aggregates usage data from raw tables to the unified usage_monthly table
 */

import { PostgresClient } from '@/lib/database/postgres-client';
import type { 
  AppType, 
  AggregationResult, 
  AggregationInput, 
  UnifiedAggregationResult,
  AppAggregationConfig 
} from '@/lib/database/types/usage-types';

export class UnifiedUsageAggregator {
  /**
   * Configuration for each app's source table and aggregation logic
   */
  private readonly appConfigs: Record<AppType, AppAggregationConfig> = {
    'date-formatter': {
      sourceTable: 'date_formatter_usage',
      timestampColumn: 'request_timestamp',
      monthFormat: `DATE_TRUNC('month', request_timestamp)::date`
    },
    'url-shortener': {
      sourceTable: 'url_shortener_usage',
      timestampColumn: 'request_timestamp',
      monthFormat: `DATE_TRUNC('month', request_timestamp)::date`
    }
  };

  /**
   * Aggregate usage data for a specific app
   * @param appType - The app to aggregate data for
   * @param fullRebuild - If true, aggregate all historical data. If false, only new data since last run
   * @returns Aggregation result with statistics
   */
  async aggregateApp(appType: AppType, fullRebuild: boolean = false): Promise<AggregationResult> {
    const startTime = new Date();
    const config = this.appConfigs[appType];
    
    try {
      // Get last aggregated timestamp (unless doing full rebuild)
      const lastTimestamp = fullRebuild ? null : await this.getLastAggregatedTimestamp(appType);
      
      // Get aggregated data from source table
      const aggregatedData = await this.getAggregatedData(appType, lastTimestamp);
      
      // Upsert to unified table
      const processedCount = await this.upsertAggregatedData(appType, aggregatedData);
      
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
      
      return {
        success: true,
        appType,
        processedCount,
        errorCount: 0,
        duration,
        totalRecords: aggregatedData.length,
        lastProcessedTimestamp: aggregatedData.length > 0 ? new Date() : undefined
      };
      
    } catch (error) {
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`Error aggregating ${appType}:`, errorMessage);
      
      return {
        success: false,
        appType,
        processedCount: 0,
        errorCount: 1,
        duration,
        totalRecords: 0,
        error: errorMessage
      };
    }
  }

  /**
   * Get the last aggregated timestamp for incremental processing
   * @param appType - The app to check
   * @returns Last processed timestamp or null if no data exists
   */
  private async getLastAggregatedTimestamp(appType: AppType): Promise<Date | null> {
    const pool = PostgresClient.getPool();
    
    const query = `
      SELECT MAX(last_request_at) as last_timestamp 
      FROM usage_monthly 
      WHERE app_type = $1
    `;
    
    const result = await pool.query(query, [appType]);
    
    return result.rows[0]?.last_timestamp || null;
  }

  /**
   * Get aggregated data from the source table
   * @param appType - The app to aggregate data for
   * @param lastTimestamp - Only aggregate data after this timestamp (null for all data)
   * @returns Array of aggregated data ready for insertion
   */
  private async getAggregatedData(appType: AppType, lastTimestamp: Date | null): Promise<AggregationInput[]> {
    const pool = PostgresClient.getPool();
    const config = this.appConfigs[appType];
    
    let query: string;
    let params: unknown[];
    
    if (appType === 'date-formatter') {
      // Date formatter aggregation query
      query = `
        SELECT 
          portal_id,
          ${config.monthFormat} as month_start,
          COUNT(*) as total_requests,
          SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
          SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests,
          MAX(${config.timestampColumn}) as last_request_at
        FROM ${config.sourceTable}
        WHERE ${config.timestampColumn} > COALESCE($1, '1970-01-01'::timestamp)
        GROUP BY portal_id, ${config.monthFormat}
        ORDER BY portal_id, month_start
      `;
      params = [lastTimestamp];
      
    } else {
      // URL shortener aggregation query with metadata
      query = `
        SELECT 
          portal_id,
          ${config.monthFormat} as month_start,
          COUNT(*) as total_requests,
          SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
          SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests,
          MAX(${config.timestampColumn}) as last_request_at,
          COUNT(DISTINCT custom_domain) FILTER (WHERE custom_domain IS NOT NULL AND custom_domain != '') as unique_domains_used
        FROM ${config.sourceTable}
        WHERE ${config.timestampColumn} > COALESCE($1, '1970-01-01'::timestamp)
        GROUP BY portal_id, ${config.monthFormat}
        ORDER BY portal_id, month_start
      `;
      params = [lastTimestamp];
    }
    
    const result = await pool.query(query, params);
    
    return result.rows.map(row => ({
      portalId: row.portal_id,
      monthStart: row.month_start,
      totalRequests: parseInt(row.total_requests),
      successfulRequests: parseInt(row.successful_requests),
      failedRequests: parseInt(row.failed_requests),
      lastRequestAt: row.last_request_at,
      metadata: appType === 'url-shortener' 
        ? { unique_domains_used: parseInt(row.unique_domains_used || 0) }
        : {}
    }));
  }

  /**
   * Upsert aggregated data to the unified table
   * @param appType - The app type for the data
   * @param data - Array of aggregated data to upsert
   * @returns Number of records processed
   */
  private async upsertAggregatedData(appType: AppType, data: AggregationInput[]): Promise<number> {
    if (data.length === 0) return 0;
    
    const pool = PostgresClient.getPool();
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      const upsertQuery = `
        INSERT INTO usage_monthly (
          portal_id, app_type, month_start, total_requests, successful_requests, failed_requests, 
          last_request_at, metadata, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (portal_id, app_type, month_start)
        DO UPDATE SET 
          total_requests = EXCLUDED.total_requests,
          successful_requests = EXCLUDED.successful_requests,
          failed_requests = EXCLUDED.failed_requests,
          last_request_at = EXCLUDED.last_request_at,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
      `;
      
      let processedCount = 0;
      
      // Process each aggregated record
      for (const item of data) {
        await client.query(upsertQuery, [
          item.portalId,
          appType,
          item.monthStart,
          item.totalRequests,
          item.successfulRequests,
          item.failedRequests,
          item.lastRequestAt,
          JSON.stringify(item.metadata)
        ]);
        processedCount++;
      }
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log(`Successfully processed ${processedCount} ${appType} records`);
      return processedCount;
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  }

  /**
   * Aggregate usage data for all apps
   * @param fullRebuild - If true, aggregate all historical data. If false, only new data since last run
   * @returns Combined results for all apps
   */
  async aggregateAll(fullRebuild: boolean = false): Promise<UnifiedAggregationResult> {
    // Run aggregations for all apps in parallel
    const [dateFormatterResult, urlShortenerResult] = await Promise.allSettled([
      this.aggregateApp('date-formatter', fullRebuild),
      this.aggregateApp('url-shortener', fullRebuild)
    ]);
    
    // Process results
    const results: Record<AppType, AggregationResult> = {
      'date-formatter': dateFormatterResult.status === 'fulfilled' 
        ? dateFormatterResult.value 
        : {
            success: false,
            appType: 'date-formatter',
            processedCount: 0,
            errorCount: 1,
            duration: 0,
            totalRecords: 0,
            error: dateFormatterResult.reason?.message || 'Promise rejected'
          },
      'url-shortener': urlShortenerResult.status === 'fulfilled' 
        ? urlShortenerResult.value 
        : {
            success: false,
            appType: 'url-shortener',
            processedCount: 0,
            errorCount: 1,
            duration: 0,
            totalRecords: 0,
            error: urlShortenerResult.reason?.message || 'Promise rejected'
          }
    };
    
    // Calculate summary statistics
    const summary = {
      totalProcessed: results['date-formatter'].processedCount + results['url-shortener'].processedCount,
      totalErrors: results['date-formatter'].errorCount + results['url-shortener'].errorCount,
      totalDuration: results['date-formatter'].duration + results['url-shortener'].duration
    };
    
    return {
      success: results['date-formatter'].success && results['url-shortener'].success,
      results,
      summary
    };
  }
}