'use client';

import { useEffect } from 'react';
import { trackDashboardView } from '@/lib/analytics/gtm';

interface DashboardTrackerProps {
  portalId?: number;
  section?: string;
}

export default function DashboardTracker({ portalId, section }: DashboardTrackerProps) {
  useEffect(() => {
    trackDashboardView(portalId, section);
  }, [portalId, section]);

  return null;
}