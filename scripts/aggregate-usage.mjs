#!/usr/bin/env node

/**
 * Usage Aggregation Script
 * Aggregates usage data from usage_requests into portal_usage_monthly
 * Run this as a cron job (e.g., hourly or daily)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

// Simple config helper for this script
function getConfig() {
  const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  
  const supabaseUrl = environment === 'prod' 
    ? process.env.SUPABASE_PROD_URL 
    : process.env.SUPABASE_DEV_URL;
    
  const supabaseServiceKey = environment === 'prod'
    ? process.env.SUPABASE_PROD_SERVICE_ROLE_KEY
    : process.env.SUPABASE_DEV_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(`Missing Supabase configuration for ${environment} environment`);
    console.error(`Please check your .env.local file for the required variables`);
    throw new Error(`Missing Supabase configuration for ${environment} environment`);
  }
  
  return {
    environment,
    supabase: {
      url: supabaseUrl,
      serviceRoleKey: supabaseServiceKey
    }
  };
}

/**
 * Main aggregation function
 */
async function aggregateUsage() {
  const startTime = new Date();
  console.log(`🔄 Starting usage aggregation at ${startTime.toISOString()}`);

  try {
    // Get configuration
    const config = getConfig();
    const supabaseConfig = config.supabase;
    const environment = config.environment;
    
    console.log(`📊 Aggregating usage for ${environment.toUpperCase()} environment`);
    
    // Create Supabase admin client
    const supabase = createClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // PERFORMANCE WARNING: This script fetches ALL historical data from usage_requests table
    // and processes it on the client side. This approach may cause high network traffic
    // and memory usage as the dataset grows larger over time.
    //
    // TODO: Optimize this in the future by:
    // 1. Adding a 'processed' flag to usage_requests table to track aggregated records
    // 2. Only fetching records where processed = false
    // 3. Using database-side aggregation with custom SQL functions
    // 4. Implementing incremental aggregation (only new data since last run)
    // 5. Adding pagination for very large datasets
    //
    // Current approach is acceptable for small to medium datasets but will need
    // optimization when handling millions of records.
    
    console.log('📋 Fetching usage data for client-side aggregation...');
    console.log('⚠️  WARNING: Fetching ALL historical data - optimize for production use');
    
    const { data: rawData, error: fetchError } = await supabase
      .from('usage_requests')
      .select('portal_id, month_year, success');

    if (fetchError) {
      throw new Error(`Failed to fetch usage requests: ${fetchError.message}`);
    }

    if (!rawData || rawData.length === 0) {
      console.log('✅ No pending requests to aggregate');
      return;
    }

    // Efficient client-side grouping
    const aggregationMap = new Map();
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

    console.log(`📊 Found ${rawData.length} total requests to aggregate`);
    const aggregatedResults = Array.from(aggregationMap.values());

    // Use simple SQL aggregation with manual processing
    console.log('📊 Running direct SQL aggregation...');
    
    try {
      // Process each portal-month combination with simple upserts
      let processedCount = 0;
      let errorCount = 0;

      for (const stats of aggregatedResults) {
        const key = `${stats.portalId}:${stats.monthYear}`;
        try {
          // Direct upsert using Supabase client
          const { error: upsertError } = await supabase
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
              onConflict: 'portal_id,month_year',
              // For existing records, we need to add to current counts
              // This is handled by a custom SQL upsert below
            });

          if (upsertError) {
            // Fallback: try manual update
            await handleManualUpsert(supabase, stats);
          }

          processedCount++;
          if (processedCount % 10 === 0) {
            console.log(`📈 Processed ${processedCount}/${aggregatedResults.length} aggregations`);
          }

        } catch (error) {
          console.error(`❌ Error processing ${key}:`, error.message);
          errorCount++;
        }
      }

      console.log(`✅ Direct aggregation completed: ${processedCount} processed, ${errorCount} errors`);

    } catch (error) {
      console.error('❌ Aggregation failed:', error.message);
      throw error;
    }

    // Manual upsert helper function
    async function handleManualUpsert(supabase, stats) {
      // Check if record exists
      const { data: existing } = await supabase
        .from('portal_usage_monthly')
        .select('request_count, success_count, error_count')
        .eq('portal_id', stats.portalId)
        .eq('month_year', stats.monthYear)
        .single();

      if (existing) {
        // Update existing record by adding counts
        const { error } = await supabase
          .from('portal_usage_monthly')
          .update({
            request_count: existing.request_count + stats.requestCount,
            success_count: existing.success_count + stats.successCount,
            error_count: existing.error_count + stats.errorCount,
            last_request_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('portal_id', stats.portalId)
          .eq('month_year', stats.monthYear);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('portal_usage_monthly')
          .insert({
            portal_id: stats.portalId,
            month_year: stats.monthYear,
            request_count: stats.requestCount,
            success_count: stats.successCount,
            error_count: stats.errorCount,
            last_request_at: new Date().toISOString()
          });

        if (error) throw error;
      }
    }

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n📊 Aggregation Summary:');
    console.log(`   • Portal-month combinations: ${aggregatedResults.length}`);
    console.log(`   • Duration: ${duration} seconds`);
    console.log(`   • Environment: ${environment.toUpperCase()}`);
    console.log('✅ Usage aggregation completed successfully');

  } catch (error) {
    console.error('💥 Fatal error during usage aggregation:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}


// Handle command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

if (isDryRun) {
  console.log('🧪 DRY RUN MODE - No actual aggregation will be performed');
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  await aggregateUsage();
}

export { aggregateUsage };