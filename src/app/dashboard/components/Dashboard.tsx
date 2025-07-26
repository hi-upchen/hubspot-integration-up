/**
 * Main dashboard component
 */

import BetaNotice from './BetaNotice';
import PortalInfoCard from './PortalInfoCard';
import UsageStatsCard from './UsageStatsCard';
import ErrorMessage from './ErrorMessage';
import type { DashboardData } from '../lib/dashboard-api';

interface DashboardProps {
  data: DashboardData;
}

export default function Dashboard({ data }: DashboardProps) {
  const { portalInfo, usageStats, portalId, error } = data;

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Portal ID: {portalId || 'Not provided'}</p>
          </div>
          <ErrorMessage message={error} title="Dashboard Error" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Portal ID: {portalId}</p>
          {portalInfo?.portalName && (
            <p className="text-sm text-gray-500">{portalInfo.portalName}</p>
          )}
        </div>

        {/* Beta Notice */}
        <BetaNotice />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Portal Info Card */}
          <PortalInfoCard portalInfo={portalInfo} portalId={portalId} />
          
          {/* Usage Stats Card */}
          <UsageStatsCard usageStats={usageStats} portalId={portalId} />
        </div>

        {/* Future: Additional cards can go here */}
        <div className="grid grid-cols-1 gap-6">
          {/* Placeholder for future features */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h3>
            <div className="text-center py-8">
              <p className="text-gray-500">More features and analytics coming soon!</p>
              <ul className="text-sm text-gray-400 mt-4 space-y-1">
                <li>• Historical usage charts</li>
                <li>• Export usage reports</li>
                <li>• Usage alerts and notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}