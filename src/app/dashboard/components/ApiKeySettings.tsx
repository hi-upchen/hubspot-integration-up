'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/Button';

interface ApiKeySettingsProps {
  portalId: number;
}

interface ApiKeyState {
  key: string;
  verified: boolean;
  loading: boolean;
  saving: boolean;
  testing: boolean;
  message: {
    text: string;
    type: 'success' | 'error' | 'info';
  } | null;
}

export function ApiKeySettings({ portalId }: ApiKeySettingsProps) {
  const [state, setState] = useState<ApiKeyState>({
    key: '',
    verified: false,
    loading: true,
    saving: false,
    testing: false,
    message: null
  });

  const loadApiKey = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch('/api/url-shortener/api-key', {
        method: 'GET',
        headers: {
          'x-portal-id': portalId.toString()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          key: data.hasKey ? '••••••••••••••••' : '',
          verified: data.verified || false,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        loading: false,
        message: {
          text: 'Failed to load API key settings',
          type: 'error'
        }
      }));
    }
  }, [portalId]);

  // Load existing API key on mount
  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  const handleSaveApiKey = async () => {
    if (!state.key || state.key.startsWith('••••')) {
      setState(prev => ({
        ...prev,
        message: {
          text: 'Please enter a valid Bitly API key',
          type: 'error'
        }
      }));
      return;
    }

    setState(prev => ({ ...prev, saving: true, message: null }));

    try {
      const response = await fetch('/api/url-shortener/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-id': portalId.toString()
        },
        body: JSON.stringify({
          apiKey: state.key
        })
      });

      const data = await response.json();

      if (response.ok) {
        setState(prev => ({
          ...prev,
          key: '••••••••••••••••',
          verified: data.verified,
          saving: false,
          message: {
            text: data.verified 
              ? 'API key saved and verified successfully!' 
              : 'API key saved but could not be verified. Please check your key.',
            type: data.verified ? 'success' : 'error'
          }
        }));
      } else {
        setState(prev => ({
          ...prev,
          saving: false,
          message: {
            text: data.error || 'Failed to save API key',
            type: 'error'
          }
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        saving: false,
        message: {
          text: 'Network error. Please try again.',
          type: 'error'
        }
      }));
    }
  };

  const handleTestConnection = async () => {
    // Check if there's a key to test (either new input or saved)
    const hasNewKey = state.key && !state.key.startsWith('••••');
    const hasSavedKey = state.verified;
    
    if (!hasNewKey && !hasSavedKey) {
      setState(prev => ({
        ...prev,
        message: {
          text: 'Please enter an API key to test',
          type: 'error'
        }
      }));
      return;
    }

    setState(prev => ({ ...prev, testing: true, message: null }));

    try {
      // Prepare the request body
      const requestBody: Record<string, unknown> = {};
      
      // If there's a new key entered, send it for testing
      if (hasNewKey) {
        requestBody.apiKey = state.key;
      }
      // Otherwise, the backend will test the saved key
      
      const response = await fetch('/api/url-shortener/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-portal-id': portalId.toString()
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      setState(prev => ({
        ...prev,
        testing: false,
        verified: data.valid,
        message: {
          text: data.valid 
            ? 'Connection test successful!' 
            : data.error || 'Connection test failed',
          type: data.valid ? 'success' : 'error'
        }
      }));
    } catch {
      setState(prev => ({
        ...prev,
        testing: false,
        message: {
          text: 'Network error during connection test',
          type: 'error'
        }
      }));
    }
  };

  if (state.loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">URL Shortener Settings</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">URL Shortener Settings</h3>
        {state.verified && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="bitly-api-key" className="block text-sm font-medium text-gray-700 mb-2">
            Bitly API Token
          </label>
          <input
            id="bitly-api-key"
            type="text"
            value={state.key}
            onChange={(e) => setState(prev => ({ ...prev, key: e.target.value, message: null }))}
            placeholder="Enter your Bitly API token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={state.saving || state.testing}
          />
          <p className="mt-1 text-sm text-gray-600">
            Get your API token from{' '}
            <a 
              href="https://app.bitly.com/settings/api/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Bitly Settings → API
            </a>
          </p>
        </div>

        {state.message && (
          <div className={`p-3 rounded-md text-sm ${
            state.message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            state.message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {state.message.text}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSaveApiKey}
            disabled={state.saving || state.testing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {state.saving ? 'Saving...' : 'Save API Key'}
          </Button>
          
          <Button
            onClick={handleTestConnection}
            disabled={state.saving || state.testing || (!state.verified && !state.key)}
            variant="outline"
          >
            {state.testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">How to get your Bitly API token:</h4>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Log in to your Bitly account</li>
            <li>Go to Settings → API</li>
            <li>Enter your password to access API settings</li>
            <li>Click &quot;Generate Token&quot;</li>
            <li>Copy the token and paste it above</li>
          </ol>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Note:</strong> Keep your API token secure and don&apos;t share it with others.
          </p>
        </div>
      </div>
    </div>
  );
}