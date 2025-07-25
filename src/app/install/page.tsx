'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function InstallContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  const handleInstall = () => {
    window.location.href = '/api/auth/hubspot/install';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Installation Successful!</h2>
              <p className="text-gray-600 mb-6">
                HubSpot Integration Up has been successfully installed to your HubSpot account.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Go to your HubSpot Workflows</li>
                  <li>• Create a new workflow or edit existing one</li>
                  <li>• Add &ldquo;Date Formatter&rdquo; action from Custom Actions</li>
                  <li>• Configure your date formatting preferences</li>
                </ul>
              </div>
              <button
                onClick={() => window.close()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Installation Failed</h2>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={handleInstall}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HubSpot Integration Up</h1>
          <p className="text-lg text-gray-600 mb-8">Workflow Date Formatter</p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What you&rsquo;ll get:</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Format dates in US, UK, ISO, and written formats</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Seamless integration with HubSpot workflows</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic date validation and error handling</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Required Permissions</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    This app needs access to your workflows and automation features to function properly.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleInstall}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Install to HubSpot
            </button>
          </div>
        </div>
      </div>
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