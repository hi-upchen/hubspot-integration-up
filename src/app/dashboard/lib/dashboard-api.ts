/**
 * Server-side API utilities for dashboard data fetching
 */

import { getPortalInfo } from '@/lib/shared/hubspot-portal';
import { getUsageStats } from '@/lib/shared/usage-tracker';
import type { PortalInfo, UsageStats } from '@/lib/shared/types';

export interface DashboardData {
  portalInfo: PortalInfo | null;
  usageStats: UsageStats | null;
  portalId: number;
  error?: string;
}

/**
 * Fetches all dashboard data for a portal (server-side)
 */
export async function fetchDashboardData(portalId: number): Promise<DashboardData> {
  try {
    // Validate portal ID
    if (!portalId || portalId <= 0) {
      return {
        portalInfo: null,
        usageStats: null,
        portalId: 0,
        error: 'Valid portal ID is required'
      };
    }

    // Fetch data in parallel
    const [portalInfo, usageStats] = await Promise.allSettled([
      getPortalInfo(portalId),
      getUsageStats(portalId)
    ]);

    // Handle portal info result
    const portalInfoData = portalInfo.status === 'fulfilled' ? portalInfo.value : null;
    
    // Handle usage stats result
    const usageStatsData = usageStats.status === 'fulfilled' ? usageStats.value : null;
    
    // If portal info is null, it means portal doesn't exist
    if (!portalInfoData) {
      return {
        portalInfo: null,
        usageStats: null,
        portalId,
        error: `Portal ${portalId} not found. Please ensure the portal is properly configured.`
      };
    }

    return {
      portalInfo: portalInfoData,
      usageStats: usageStatsData,
      portalId
    };

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      portalInfo: null,
      usageStats: null,
      portalId,
      error: 'Failed to load dashboard data. Please try again later.'
    };
  }
}