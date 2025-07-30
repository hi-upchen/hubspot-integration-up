'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';

function InstallContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  const handleInstall = () => {
    window.location.href = '/api/auth/hubspot/install';
  };

  if (success) {
    return (
      <div className="overflow-hidden bg-white">
        <Container className="pt-20 pb-16 text-center lg:pt-32">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-8">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl">
            Installation{' '}
            <span className="relative whitespace-nowrap text-green-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 418 42"
                className="absolute top-2/3 left-0 h-[0.58em] w-full fill-green-300/70"
                preserveAspectRatio="none"
              >
                <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
              </svg>
              <span className="relative">Successful!</span>
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            HubSpot Integration Up has been successfully installed to your HubSpot account. 
            You&apos;re ready to start formatting dates like a pro!
          </p>

          {/* Next Steps Section */}
          <div className="mx-auto mt-16 max-w-2xl rounded-2xl bg-slate-50 p-8 shadow-xl shadow-slate-900/10">
            <h2 className="font-display text-2xl tracking-tight text-slate-900 mb-6">
              🎯 Next Steps
            </h2>
            <div className="text-left space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-4 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Go to HubSpot Workflows</h3>
                  <p className="text-slate-600 text-sm">Navigate to Automation → Workflows in your HubSpot account</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-4 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Add Date Formatter Action</h3>
                  <p className="text-slate-600 text-sm">Look for &ldquo;Format Date&rdquo; in your Custom Actions section</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-4 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Configure & Test</h3>
                  <p className="text-slate-600 text-sm">Choose your source and target formats, then test with sample data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex justify-center gap-x-6">
            <Button 
              href="https://app.hubspot.com/workflows"
              color="hubspot"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open HubSpot Workflows
            </Button>
            <Button 
              onClick={() => {
                // Try multiple methods to close the window
                if (window.opener) {
                  window.close();
                } else {
                  // If opened in same window, redirect to HubSpot
                  window.location.href = 'https://app.hubspot.com/workflows';
                }
              }}
              variant="outline"
              color="slate"
            >
              Close Window
            </Button>
          </div>

          {/* Success Badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
              <svg className="h-4 w-4 text-green-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Ready to Use
            </div>
            <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
              <svg className="h-4 w-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Instant Processing
            </div>
            <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
              <svg className="h-4 w-4 text-purple-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure & Private
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    const errorMessages: Record<string, string> = {
      'missing_code': 'Authorization code was not provided',
      'invalid_state': 'Invalid security state parameter',
      'callback_failed': 'OAuth callback processing failed',
      'access_denied': 'You denied access to the application'
    };

    const errorMessage = errorMessages[error] || 'An unknown error occurred';

    return (
      <div className="overflow-hidden bg-white">
        <Container className="pt-20 pb-16 text-center lg:pt-32">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-8">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl">
            Installation{' '}
            <span className="relative whitespace-nowrap text-red-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 418 42"
                className="absolute top-2/3 left-0 h-[0.58em] w-full fill-red-300/70"
                preserveAspectRatio="none"
              >
                <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
              </svg>
              <span className="relative">Failed</span>
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
            {errorMessage}
          </p>

          {/* Error Details */}
          <div className="mx-auto mt-16 max-w-2xl rounded-2xl bg-red-50 p-8 shadow-xl shadow-slate-900/10">
            <h2 className="font-display text-2xl tracking-tight text-slate-900 mb-6">
              ⚠️ What happened?
            </h2>
            <div className="text-left space-y-4">
              <p className="text-slate-700">
                The installation process encountered an issue. This is usually temporary and can be resolved by trying again.
              </p>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-sm font-mono text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex justify-center gap-x-6">
            <Button 
              onClick={handleInstall}
              color="hubspot"
            >
              Try Again
            </Button>
            <Button 
              href="/"
              variant="outline"
              color="slate"
            >
              Back to Home
            </Button>
          </div>

          {/* Help Info */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
              <svg className="h-4 w-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need Help?
            </div>
            <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
              <svg className="h-4 w-4 text-green-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hi.upchen@gmail.com
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white">
      <Container className="pt-20 pb-16 text-center lg:pt-32">
        {/* Hero Section */}
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
          Install HubSpot{' '}
          <span className="relative whitespace-nowrap text-blue-600">
            <svg
              aria-hidden="true"
              viewBox="0 0 418 42"
              className="absolute top-2/3 left-0 h-[0.58em] w-full fill-blue-300/70"
              preserveAspectRatio="none"
            >
              <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
            </svg>
            <span className="relative">Date Formatter</span>
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
          Professional date formatting for your HubSpot workflows. 
          Zero permissions required, full code transparency.
        </p>

        {/* Features Section */}
        <div className="mx-auto mt-16 max-w-2xl rounded-2xl bg-slate-50 p-8 shadow-xl shadow-slate-900/10">
          <h2 className="font-display text-2xl tracking-tight text-slate-900 mb-6">
            ✨ What you&apos;ll get
          </h2>
          <div className="text-left space-y-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-slate-900">15+ Date Formats</h3>
                <p className="text-slate-600 text-sm">US, UK, ISO, Taiwan, Japan, Korea, and custom formats</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-slate-900">Smart Year Handling</h3>
                <p className="text-slate-600 text-sm">Automatically handles 2-digit years (25 → 2025, 99 → 1999)</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-slate-900">Seamless Integration</h3>
                <p className="text-slate-600 text-sm">Works with all HubSpot workflow types - contacts, companies, deals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Notice */}
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800">Installation Requirements</h3>
              <p className="text-amber-700 text-sm mt-1">
                This app only needs basic workflow access. No contact data, no sensitive permissions required.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-10 flex justify-center gap-x-6">
          <Button onClick={handleInstall} color="hubspot">
            Install to HubSpot
          </Button>
          <Button 
            href="/"
            variant="outline"
            color="slate"
          >
            Back to Home
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
            <svg className="h-4 w-4 text-green-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security First
          </div>
          <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
            <svg className="h-4 w-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Zero Permissions
          </div>
          <div className="flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-900/5">
            <svg className="h-4 w-4 text-purple-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Open Source
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function InstallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <InstallContent />
    </Suspense>
  );
}