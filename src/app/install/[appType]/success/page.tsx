/**
 * Dynamic Installation Success Page
 * Shows success message for different app types
 */

import Link from 'next/link';
import { Container } from '@/components/Container';

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
  
  if (!config) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unknown App Type</h1>
            <p className="text-gray-600 mb-6">The app type &quot;{appType}&quot; is not recognized.</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go Home
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {config.name} Installed Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {config.description}
          </p>

          {/* Features */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What you can do now:</h2>
            <ul className="text-left space-y-2">
              {config.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps:</h2>
            <ol className="text-left space-y-2">
              {config.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-medium mr-3 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {portalId ? (
              <Link
                href={`/dashboard?portalId=${portalId}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
            
            <a
              href="https://app.hubspot.com/workflows"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Open HubSpot Workflows
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help getting started?{' '}
              <a href="mailto:support@integrationup.com" className="text-blue-600 hover:text-blue-800">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </Container>
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