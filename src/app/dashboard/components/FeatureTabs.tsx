'use client';

import React, { useState } from 'react';
import { UsageStatsCard } from './UsageStatsCard';
import { ApiKeySettings } from './ApiKeySettings';

interface FeatureTabsProps {
  portalId: number;
  usageStats: any;
  urlShortenerStats?: any;
}

type TabId = 'date-formatter' | 'url-shortener';

interface Tab {
  id: TabId;
  name: string;
  description: string;
  available: boolean;
}

const tabs: Tab[] = [
  {
    id: 'date-formatter',
    name: 'Date Formatter',
    description: 'Format dates in HubSpot workflows',
    available: true
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten URLs with Bitly',
    available: true
  }
];

export function FeatureTabs({ portalId, usageStats, urlShortenerStats }: FeatureTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('date-formatter');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'date-formatter':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Date Formatter</h3>
              <p className="text-gray-600 mb-4">
                Convert dates between different formats in your HubSpot workflows. 
                Supports US, UK, ISO, Taiwan, Korea, Japan, and custom formats.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {usageStats?.currentMonth?.totalRequests || 0}
                  </div>
                  <div className="text-sm text-blue-600">Requests This Month</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {usageStats?.currentMonth ? 
                      Math.round((usageStats.currentMonth.successfulRequests / usageStats.currentMonth.totalRequests) * 100) || 0
                      : 0}%
                  </div>
                  <div className="text-sm text-green-600">Success Rate</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {usageStats?.allTimeRequests || 0}
                  </div>
                  <div className="text-sm text-purple-600">All Time Requests</div>
                </div>
              </div>
            </div>
            
            {usageStats && <UsageStatsCard usageStats={usageStats} portalId={portalId} />}
          </div>
        );

      case 'url-shortener':
        return (
          <div className="space-y-6">
            <ApiKeySettings portalId={portalId} />
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">URL Shortener Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {urlShortenerStats?.total || 0}
                  </div>
                  <div className="text-sm text-blue-600">URLs Shortened</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {urlShortenerStats?.successful || 0}
                  </div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {urlShortenerStats?.failed || 0}
                  </div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {urlShortenerStats?.uniqueDomains || 0}
                  </div>
                  <div className="text-sm text-purple-600">Custom Domains</div>
                </div>
              </div>
              
              {(!urlShortenerStats || urlShortenerStats.total === 0) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-center">
                    No URL shortening activity yet. Configure your Bitly API key above and start shortening URLs in your HubSpot workflows!
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!tab.available}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : tab.available
                  ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
                }
                transition-colors duration-200
              `}
            >
              <div className="flex flex-col items-start">
                <span>{tab.name}</span>
                <span className="text-xs font-normal text-gray-400">
                  {tab.description}
                </span>
              </div>
              {!tab.available && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}