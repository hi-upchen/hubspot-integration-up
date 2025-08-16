import { NextResponse } from 'next/server';
import { ConfigManager } from '@/lib/config/config-manager';

/**
 * Health endpoint for monitoring and load balancer checks
 * Returns minimal, security-safe information about configuration status
 */
export async function GET() {
  try {
    const environment = ConfigManager.getCurrentEnvironment();
    
    // Simple check - just try to get config
    try {
      ConfigManager.getConfig(); // This will load and validate
      const source = ConfigManager.getConfigSource();
      
      return NextResponse.json({
        status: 'healthy',
        environment,
        config: { 
          source, 
          valid: true 
        },
        services: {
          hubspot: 'configured',
          database: 'configured'
        },
        timestamp: new Date().toISOString()
      });
    } catch (configError) {
      // Configuration loading failed
      return NextResponse.json({
        status: 'error', 
        environment,
        config: { 
          source: 'none', 
          valid: false 
        },
        services: {
          hubspot: 'unavailable',
          database: 'unavailable'
        },
        error: 'Configuration not available',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (systemError) {
    // System-level error
    return NextResponse.json({
      status: 'error',
      environment: 'unknown', 
      config: { 
        source: 'none', 
        valid: false 
      },
      services: {
        hubspot: 'unknown',
        database: 'unknown'
      },
      error: 'System error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Health endpoint also supports HEAD requests for simple alive checks
 */
export async function HEAD() {
  try {
    ConfigManager.getConfig();
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}