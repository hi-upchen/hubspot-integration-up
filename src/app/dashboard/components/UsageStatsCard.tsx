/**
 * Usage stats card component
 */

import type { UsageStats } from '@/lib/database/types';

interface UsageStatsCardProps {
  usageStats: UsageStats | null;
  portalId: number;
}

export function UsageStatsCard({ usageStats }: UsageStatsCardProps) {
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
  const successRate = currentUsage > 0 ? (successCount / currentUsage) * 100 : 0;
  const errorRate = currentUsage > 0 ? (errorCount / currentUsage) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
        <span className="text-sm text-gray-500">{monthYear}</span>
      </div>
      
      {/* Hero Metric with Modern Card Design - Show only successful requests */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">{successCount.toLocaleString()}</div>
            <div className="text-sm font-medium text-gray-600">Successful API Calls</div>
            <div className="text-xs text-gray-500">{monthYear}</div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Progress Bar - Show breakdown if there are any attempts */}
      {currentUsage > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
            <span className="text-green-600">{successCount.toLocaleString()} successful</span>
            <span className="text-red-600">{errorCount.toLocaleString()} failed attempts</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
            {/* Success segment */}
            {successRate > 0 && (
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-4 transition-all duration-500"
                style={{ width: `${successRate}%` }}
              ></div>
            )}
            {/* Error segment */}
            {errorRate > 0 && (
              <div
                className="bg-gradient-to-r from-red-500 to-red-400 h-4 transition-all duration-500"
                style={{ width: `${errorRate}%` }}
              ></div>
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span></span>
            <span>{currentUsage.toLocaleString()} total attempts</span>
          </div>
        </div>
      )}

      {/* Enhanced Beta Status Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-blue-700">Beta Access</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            FREE
          </span>
        </div>
      </div>
    </div>
  );
}