/**
 * Server-side API utilities for dashboard data fetching
 */

import { portalService } from '@/lib/hubspot/portal';
import { getUsageStats } from '@/lib/database/usage';
import type { PortalInfo } from '@/lib/hubspot/types';
import type { UsageStats } from '@/lib/database/types';

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
      portalService.getPortalInfo(portalId),
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