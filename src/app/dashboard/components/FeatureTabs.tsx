'use client';

import React, { useState } from 'react';
import { AppUsageChart } from './AppUsageChart';
import { ApiKeySettings } from './ApiKeySettings';
import type { UsageStats } from '@/lib/database/types';

interface FeatureTabsProps {
  portalId: number;
  usageStats: UsageStats | null;
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

export function FeatureTabs({ portalId, usageStats }: FeatureTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('date-formatter');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'date-formatter':
        return (
          <div className="space-y-6">
            <AppUsageChart appData={usageStats?.apps.find(app => app.appType === 'date-formatter')} />
          </div>
        );

      case 'url-shortener':
        return (
          <div className="space-y-6">
            <ApiKeySettings portalId={portalId} />
            
            <AppUsageChart appData={usageStats?.apps.find(app => app.appType === 'url-shortener')} />
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