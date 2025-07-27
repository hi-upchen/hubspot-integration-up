/**
 * Domain types for portal services
 */

export interface PortalInfo {
  portalId: number;
  portalName?: string;
  userEmail?: string;
  domain?: string;
  userName?: string;
  organizationName?: string;
  hubspotUserId?: number;
  hubId?: number;
}

export interface PortalUserData {
  userName: string;
  organizationName: string;
}

/**
 * Usage tracking types
 */

export interface UsageTrackingData {
  portalId: number;
  sourceDate?: string; // Optional to allow tracking validation failures
  sourceFormat?: string; // Optional to allow tracking validation failures
  targetFormat?: string; // Optional to allow tracking validation failures
  customTargetFormat?: string;
  success: boolean;
  errorMessage?: string;
  timestamp?: Date;
}

export interface TrackingResult {
  success: boolean;
  error?: string;
}

export interface UsageStats {
  currentUsage: number;
  successCount: number;
  errorCount: number;
  monthYear: string;
}

export interface UsageAnalytics {
  monthlyUsage: Array<{
    monthYear: string;
    requestCount: number;
    successCount: number;
    errorCount: number;
  }>;
  totalRequests: number;
  averageMonthlyRequests: number;
}