/**
 * Usage stats card component
 */

import type { UsageStats } from '@/lib/services/types';

interface UsageStatsCardProps {
  usageStats: UsageStats | null;
  portalId: number;
}

export default function UsageStatsCard({ usageStats, portalId }: UsageStatsCardProps) {
  if (!usageStats) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No usage data available</p>
          <p className="text-sm text-gray-400 mt-2">Start using the date formatter to see your statistics</p>
        </div>
      </div>
    );
  }

  const { currentUsage, successCount, errorCount, monthYear } = usageStats;
  const successRate = currentUsage > 0 ? Math.round((successCount / currentUsage) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
        <span className="text-sm text-gray-500">{monthYear}</span>
      </div>
      
      {/* Main Usage Counter */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-blue-600">{currentUsage.toLocaleString()}</div>
        <div className="text-sm text-gray-500">Requests This Month</div>
      </div>

      {/* Success/Error Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-semibold text-green-600">{successCount.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600">{errorCount.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Errors</div>
        </div>
      </div>

      {/* Success Rate Bar */}
      {currentUsage > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Success Rate</span>
            <span>{successRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Beta Notice */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-blue-600">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Free during beta period
        </div>
      </div>
    </div>
  );
}