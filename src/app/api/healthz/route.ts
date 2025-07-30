import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ConfigManager } from '@/lib/config/config-manager';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: string;
  error?: string;
  environment?: string;
  details?: any;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  environment: string;
  version: string;
  checks: {
    database: HealthCheck;
    hubspot: HealthCheck;
    config: HealthCheck;
  };
  summary: {
    healthy: number;
    unhealthy: number;
    total: number;
  };
}

/**
 * Health Check Endpoint - /api/healthz
 * 
 * Industry Best Practices Implemented:
 * - Core service dependency checks (database, external APIs, config)
 * - Response time monitoring for performance insights
 * - Standard HTTP status codes (200=healthy, 503=unhealthy, 206=degraded)
 * - Check all services for complete diagnostic picture
 * - Disable caching with Cache-Control headers
 * - Efficient database queries (SELECT 1)
 * - Environment-aware health checks
 * - Structured JSON response format
 */
export async function GET() {
  const startTime = Date.now();
  
  console.log('🏥 Health check started');
  
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: ConfigManager.getCurrentEnvironment(),
    version: '1.0.0',
    checks: {
      database: { status: 'healthy' },
      hubspot: { status: 'healthy' },
      config: { status: 'healthy' }
    },
    summary: {
      healthy: 0,
      unhealthy: 0,
      total: 3
    }
  };

  // 1. Config Health Check
  console.log('🔧 Checking configuration...');
  const configStart = Date.now();
  try {
    const currentEnv = ConfigManager.getCurrentEnvironment();
    const requiredVars = [
      'HUBSPOT_CLIENT_ID',
      'HUBSPOT_CLIENT_SECRET', 
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => {
      const envVar = currentEnv === 'prod' 
        ? varName.replace('HUBSPOT_', 'HUBSPOT_PROD_').replace('SUPABASE_', 'SUPABASE_PROD_')
        : varName.replace('HUBSPOT_', 'HUBSPOT_DEV_').replace('SUPABASE_', 'SUPABASE_DEV_');
      return !process.env[envVar];
    });

    if (missingVars.length > 0) {
      response.checks.config = {
        status: 'unhealthy',
        responseTime: `${Date.now() - configStart}ms`,
        error: `Missing environment variables: ${missingVars.join(', ')}`,
        environment: currentEnv
      };
    } else {
      response.checks.config = {
        status: 'healthy',
        responseTime: `${Date.now() - configStart}ms`,
        environment: currentEnv,
        details: {
          requiredVars: 'all_present',
          environment: currentEnv
        }
      };
    }
    console.log(`✅ Config check completed in ${Date.now() - configStart}ms`);
  } catch (error) {
    response.checks.config = {
      status: 'unhealthy',
      responseTime: `${Date.now() - configStart}ms`,
      error: error instanceof Error ? error.message : 'Config check failed'
    };
    console.error(`❌ Config check failed:`, error);
  }

  // 2. Database Health Check
  console.log('💾 Checking database connection...');
  const dbStart = Date.now();
  try {
    const currentEnv = ConfigManager.getCurrentEnvironment();
    const supabaseConfig = ConfigManager.getSupabaseConfig();
    const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
    
    // Efficient health check query - industry best practice
    const { data, error } = await supabase
      .from('portal_info')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    response.checks.database = {
      status: 'healthy',
      responseTime: `${Date.now() - dbStart}ms`,
      environment: currentEnv,
      details: {
        connection: 'active',
        query: 'SELECT 1 equivalent successful'
      }
    };
    console.log(`✅ Database check completed in ${Date.now() - dbStart}ms`);
  } catch (error) {
    response.checks.database = {
      status: 'unhealthy',
      responseTime: `${Date.now() - dbStart}ms`,
      error: error instanceof Error ? error.message : 'Database connection failed',
      environment: ConfigManager.getCurrentEnvironment()
    };
    console.error(`❌ Database check failed:`, error);
  }

  // 3. HubSpot API Health Check
  console.log('🔗 Checking HubSpot API connectivity...');
  const hubspotStart = Date.now();
  try {
    const currentEnv = ConfigManager.getCurrentEnvironment();
    const hubspotConfig = ConfigManager.getHubSpotConfig();
    
    // Test HubSpot OAuth endpoint availability (doesn't require auth)
    const oauthUrl = `https://app.hubspot.com/oauth/authorize?client_id=${hubspotConfig.clientId}&scope=oauth&redirect_uri=test`;
    const response_hubspot = await fetch(oauthUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (response_hubspot.ok || response_hubspot.status === 302) {
      // 302 redirect is expected for OAuth endpoint
      response.checks.hubspot = {
        status: 'healthy',
        responseTime: `${Date.now() - hubspotStart}ms`,
        environment: currentEnv,
        details: {
          endpoint: 'oauth_available',
          statusCode: response_hubspot.status
        }
      };
      console.log(`✅ HubSpot check completed in ${Date.now() - hubspotStart}ms`);
    } else {
      throw new Error(`HubSpot API returned status ${response_hubspot.status}`);
    }
  } catch (error) {
    response.checks.hubspot = {
      status: 'unhealthy',
      responseTime: `${Date.now() - hubspotStart}ms`,
      error: error instanceof Error ? error.message : 'HubSpot API check failed',
      environment: ConfigManager.getCurrentEnvironment()
    };
    console.error(`❌ HubSpot check failed:`, error);
  }

  // Calculate summary
  Object.values(response.checks).forEach(check => {
    if (check.status === 'healthy') {
      response.summary.healthy++;
    } else {
      response.summary.unhealthy++;
    }
  });

  // Determine overall status
  if (response.summary.unhealthy === 0) {
    response.status = 'healthy';
  } else if (response.summary.healthy > 0) {
    response.status = 'degraded';
  } else {
    response.status = 'unhealthy';
  }

  const totalTime = Date.now() - startTime;
  console.log(`🏥 Health check completed in ${totalTime}ms - Status: ${response.status}`);
  console.log(`📊 Summary: ${response.summary.healthy}/${response.summary.total} services healthy`);

  // Return appropriate HTTP status code - industry best practice
  let httpStatus: number;
  switch (response.status) {
    case 'healthy':
      httpStatus = 200;
      break;
    case 'degraded':
      httpStatus = 206; // Partial Content - some services working
      break;
    case 'unhealthy':
      httpStatus = 503; // Service Unavailable
      break;
  }

  return NextResponse.json(response, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate', // Disable caching - best practice
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}