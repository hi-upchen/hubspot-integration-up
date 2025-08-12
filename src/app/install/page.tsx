'use client';

import { useState } from 'react';
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

export default function InstallPage() {
  const [installing, setInstalling] = useState<string | null>(null);

  const handleInstall = async (appId: string) => {
    if (!apps.find(app => app.id === appId)?.available) {
      return;
    }

    setInstalling(appId);

    try {
      // Get the OAuth URL for this app type
      const response = await fetch(`/api/hubspot/${appId}/install`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to HubSpot OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to initiate installation');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      alert('Installation failed. Please try again.');
      setInstalling(null);
    }
  };

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
              <Button
                onClick={() => handleInstall(app.id)}
                disabled={!app.available || installing === app.id}
                className={`w-full ${
                  app.available
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {installing === app.id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Installing...
                  </>
                ) : app.available ? (
                  'Install to HubSpot'
                ) : (
                  'Coming Soon'
                )}
              </Button>
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