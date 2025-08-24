'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

interface App {
  id: string;
  name: string;
  description: string;
  features: string[];
  icon: string;
  available: boolean;
  comingSoon?: boolean;
}

const apps: App[] = [
  {
    id: 'date-formatter',
    name: 'Date Formatter',
    description: 'Convert dates between different formats in your HubSpot workflows',
    features: [
      '15+ date formats (US, UK, ISO, Taiwan, Japan, Korea)',
      'Smart 2-digit year handling',
      'Custom format support',
      'Error-resistant processing'
    ],
    icon: '📅',
    available: true
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten URLs using Bitly in your HubSpot workflows',
    features: [
      'Powered by Bitly API',
      'Custom branded domain support',
      'Usage tracking and analytics',
      'Reliable URL shortening'
    ],
    icon: '🔗',
    available: true
  },
  {
    id: 'data-transformer',
    name: 'Data Transformer',
    description: 'Transform and manipulate data in your workflows',
    features: [
      'Text case conversion',
      'Number formatting',
      'Data validation',
      'Custom transformations'
    ],
    icon: '🔄',
    available: false,
    comingSoon: true
  }
];

function InstallPageContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters from redirects
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  return (
    <div className="overflow-hidden bg-white">
      <Container className="pt-20 pb-16 lg:pt-32">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl">
            Choose Your{' '}
            <span className="relative whitespace-nowrap text-blue-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 418 42"
                className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-300/70"
                preserveAspectRatio="none"
              >
                <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
              </svg>
              <span className="relative">Integration</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            Select the Integration Up app you&apos;d like to install to your HubSpot account.
            Each app is designed to solve specific workflow challenges.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 mx-auto max-w-2xl">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Installation Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <p className="mt-2 text-sm text-red-600">Please try again or contact support if the problem persists.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`relative rounded-2xl p-8 shadow-xl shadow-slate-900/10 ${
                app.available 
                  ? 'bg-white ring-1 ring-slate-900/5' 
                  : 'bg-slate-50 ring-1 ring-slate-900/5 opacity-75'
              }`}
            >
              {/* Coming Soon Badge */}
              {app.comingSoon && (
                <div className="absolute -top-3 -right-3 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
                  Coming Soon
                </div>
              )}

              {/* App Icon */}
              <div className="text-4xl mb-4">{app.icon}</div>

              {/* App Info */}
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {app.name}
              </h3>
              <p className="text-slate-600 mb-6">
                {app.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {app.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <svg 
                      className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Install Button */}
              {app.available ? (
                <Button
                  href={`/api/hubspot/${app.id}/install`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Install to HubSpot
                </Button>
              ) : (
                <Button
                  disabled
                  className="w-full bg-slate-300 text-slate-500 cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Installation Info */}
        <div className="mx-auto max-w-2xl rounded-2xl bg-slate-50 p-8 shadow-xl shadow-slate-900/10">
          <h2 className="font-display text-2xl tracking-tight text-slate-900 mb-6 text-center">
            🔐 Installation Information
          </h2>
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-slate-700">Minimal permissions required</span>
            </div>
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-slate-700">Instant activation after install</span>
            </div>
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-slate-700">Free during beta period</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-10">
          <Button 
            href="/"
            variant="outline"
            color="slate"
          >
            Back to Home
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default function InstallPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InstallPageContent />
    </Suspense>
  );
}