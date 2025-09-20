/**
 * Dynamic Installation Success Page
 * Shows success message for different app types
 */

import ClientSuccessPage from './ClientSuccessPage';

interface SuccessPageProps {
  params: Promise<{
    appType: string;
  }>;
  searchParams: Promise<{
    portalId?: string;
  }>;
}

const appConfigs = {
  'date-formatter': {
    name: 'Date Formatter',
    description: 'Convert dates between different formats in your HubSpot workflows',
    features: [
      'Support for US, UK, ISO, Taiwan, Korea, Japan formats',
      'Custom format options',
      'Handles 2-digit years intelligently',
      'Error-resistant processing'
    ],
    nextSteps: [
      'Go to your HubSpot workflows',
      'Add a "Custom workflow action"',
      'Select "Date Formatter" from your installed actions',
      'Configure your date formatting needs'
    ]
  },
  'url-shortener': {
    name: 'URL Shortener',
    description: 'Shorten URLs using Bitly in your HubSpot workflows',
    features: [
      'Powered by Bitly API',
      'Custom branded domain support',
      'Reliable URL shortening',
      'Usage tracking and analytics'
    ],
    nextSteps: [
      'Configure your Bitly API key in the dashboard',
      'Go to your HubSpot workflows',
      'Add a "Custom workflow action"',
      'Select "URL Shortener" from your installed actions',
      'Start shortening URLs automatically'
    ]
  }
};

export default async function InstallSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { appType } = await params;
  const { portalId } = await searchParams;

  const config = appConfigs[appType as keyof typeof appConfigs];

  return (
    <ClientSuccessPage
      appType={appType}
      portalId={portalId}
      config={config}
    />
  );
}

export async function generateMetadata({ params }: SuccessPageProps) {
  const { appType } = await params;
  const config = appConfigs[appType as keyof typeof appConfigs];

  return {
    title: config ? `${config.name} - Installation Success` : 'Installation Success',
    description: config?.description || 'Successfully installed Integration Up app',
  };
}