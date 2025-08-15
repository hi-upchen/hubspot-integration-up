'use client';

import React from 'react';
import type { AppUsageData } from '@/lib/database/types';

interface AppUsageChartProps {
  appData: AppUsageData | undefined;
}

export function AppUsageChart({ appData }: AppUsageChartProps) {
  if (!appData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Last 3 Months Usage</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No usage data available</p>
          <p className="text-sm text-gray-400 mt-2">Start using this feature to see your statistics</p>
        </div>
      </div>
    );
  }

  const { appType, monthlyData } = appData;
  
  // Calculate max total requests for scaling the bars
  const maxTotalRequests = Math.max(
    ...monthlyData.map(m => m.successfulRequests + m.failedRequests),
    1 // Minimum of 1 to avoid division by zero
  );
  
  // Convert app type to display name
  const displayName = appType === 'date-formatter' ? 'Date Formatter' : 'URL Shortener';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">{displayName} - Last 3 Months</h3>
      
      <div className="space-y-4">
        {monthlyData.map((month) => {
          const total = month.successfulRequests + month.failedRequests;
          
          // Calculate bar segment widths as percentage of max total requests
          const successWidth = maxTotalRequests > 0 ? (month.successfulRequests / maxTotalRequests) * 100 : 0;
          const failedWidth = maxTotalRequests > 0 ? (month.failedRequests / maxTotalRequests) * 100 : 0;
          const totalWidth = successWidth + failedWidth;
          
          // Format month display
          const monthDisplay = new Date(month.month + '-01').toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });

          return (
            <div key={month.month} className="space-y-2">
              {/* Month label with current month highlight and stats in one line */}
              <div className="flex items-center text-sm space-x-6">
                {/* Left side: Date and Current badge */}
                <div className="flex items-center">
                  <span className={`font-medium ${month.isCurrentMonth ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                    {monthDisplay}
                  </span>
                  {month.isCurrentMonth && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Current
                    </span>
                  )}
                </div>
                
                {/* Stats aligned to left after date */}
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                    {month.successfulRequests} successful
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                    {month.failedRequests} failed
                  </span>
                  <span className="text-gray-500">
                    {total.toLocaleString()} total
                  </span>
                </div>
              </div>
              
              {/* Horizontal bar chart - length represents total request volume */}
              <div className="relative">
                {total > 0 ? (
                  <div 
                    className="bg-gray-100 rounded-lg h-6 overflow-hidden flex"
                    style={{ width: `${Math.max(totalWidth, 10)}%` }}
                  >
                    {/* Success segment */}
                    {month.successfulRequests > 0 && (
                      <div
                        className="bg-emerald-500 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${(month.successfulRequests / total) * 100}%` }}
                        title={`${month.successfulRequests} successful requests`}
                      >
                        {successWidth > 15 && (
                          <span className="text-white text-xs font-medium">
                            {month.successfulRequests}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Failed segment */}
                    {month.failedRequests > 0 && (
                      <div
                        className="bg-red-500 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${(month.failedRequests / total) * 100}%` }}
                        title={`${month.failedRequests} failed requests`}
                      >
                        {failedWidth > 15 && (
                          <span className="text-white text-xs font-medium">
                            {month.failedRequests}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-6 flex items-center justify-center" style={{ width: '20%' }}>
                    <span className="text-gray-400 text-xs">No activity</span>
                  </div>
                )}
              </div>
              
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-center space-x-6">
          <div className="flex items-center text-sm">
            <div className="w-3 h-3 bg-emerald-500 rounded mr-2"></div>
            <span className="text-gray-600">Successful</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-gray-600">Failed</span>
          </div>
        </div>
      </div>
    </div>
  );
}