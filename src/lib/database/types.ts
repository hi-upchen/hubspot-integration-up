/**
 * Database-related types
 */

export interface MonthlyUsage {
  month: string;              // "2025-01"
  successfulRequests: number;
  failedRequests: number;
  isCurrentMonth: boolean;
}

export interface AppUsageData {
  appType: string;           // "date-formatter" | "url-shortener"
  monthlyData: MonthlyUsage[]; // 3 months for this app
}

export interface UsageStats {
  portalId: number;
  apps: AppUsageData[];      // Separate data per app
}

export interface TrackingResult {
  success: boolean;
  message: string;
  error?: Error;
}

// Database record types (raw from database)
export interface PortalInfoRecord {
  portal_id: number;
  name: string;
  domain: string;
  user_email: string | null;
  user_name: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

export interface HubSpotInstallationRecord {
  id: string;
  hub_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string;
  app_type: string;
  created_at: string;
  updated_at: string;
}

export interface UsageRequestRecord {
  id: string;
  portal_id: number;
  source_date?: string;
  source_format?: string;
  target_format?: string;
  custom_target_format?: string;
  formatted_date?: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface PortalUsageMonthlyRecord {
  id: string;
  portal_id: number;
  month_year: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  created_at: string;
  updated_at: string;
}