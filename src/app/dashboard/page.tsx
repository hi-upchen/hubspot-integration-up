/**
 * Dashboard page with server-side rendering
 */

import { Suspense } from 'react';
import Dashboard from './components/Dashboard';
import ErrorMessage from './components/ErrorMessage';
import { fetchDashboardData } from './lib/dashboard-api';

interface DashboardPageProps {
  searchParams: Promise<{ 
    portalId?: string;
  }>;
}

// Loading component for Suspense
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6 mb-8"></div>
          <div className="h-20 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main dashboard page component
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Parse portal ID from URL parameters
  const params = await searchParams;
  const portalIdParam = params.portalId;
  
  // Handle missing portal ID
  if (!portalIdParam) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <ErrorMessage 
            message="Please provide a portal ID in the URL. Example: /dashboard?portalId=123"
            title="Portal ID Required"
          />
        </div>
      </div>
    );
  }

  const portalId = parseInt(portalIdParam, 10);
  
  // Handle invalid portal ID
  if (isNaN(portalId) || portalId <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <ErrorMessage 
            message={`"${portalIdParam}" is not a valid portal ID. Please provide a positive integer.`}
            title="Invalid Portal ID"
          />
        </div>
      </div>
    );
  }

  // Fetch dashboard data server-side
  const dashboardData = await fetchDashboardData(portalId);

  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard data={dashboardData} />
    </Suspense>
  );
}

// Optional: Add metadata
export async function generateMetadata({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const portalId = params.portalId;
  return {
    title: portalId ? `Dashboard - Portal ${portalId}` : 'Dashboard',
    description: 'HubSpot Date Formatter Dashboard - View usage statistics and manage your portal settings',
  };
}