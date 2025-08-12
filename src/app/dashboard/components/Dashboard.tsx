/**
 * Main dashboard component
 */

import BetaNotice from './BetaNotice';
import PortalInfoCard from './PortalInfoCard';
import { FeatureTabs } from './FeatureTabs';
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

        {/* Portal Info Card */}
        <div className="mb-8">
          <PortalInfoCard portalInfo={portalInfo} portalId={portalId} />
        </div>

        {/* Feature Tabs */}
        <FeatureTabs 
          portalId={portalId}
          usageStats={usageStats}
        />
      </div>
    </div>
  );
}