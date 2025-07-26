'use client';

/**
 * Portal info card with editable user details
 */

import { useState } from 'react';
import type { PortalInfo } from '@/lib/services/types';

interface PortalInfoCardProps {
  portalInfo: PortalInfo | null;
  portalId: number;
}

export default function PortalInfoCard({ portalInfo, portalId }: PortalInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [userName, setUserName] = useState(portalInfo?.userName || '');
  const [organizationName, setOrganizationName] = useState(portalInfo?.organizationName || '');

  const handleSave = async () => {
    if (!userName.trim() || !organizationName.trim()) {
      setError('Both name and organization are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/portal/info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portalId,
          userName: userName.trim(),
          organizationName: organizationName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update profile');
      }

      setSuccess(true);
      setIsEditing(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUserName(portalInfo?.userName || '');
    setOrganizationName(portalInfo?.organizationName || '');
    setIsEditing(false);
    setError(null);
  };

  if (!portalInfo) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portal Information</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Portal information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Portal Information</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Portal Name (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portal Name
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
            {portalInfo.portalName || 'N/A'}
          </p>
        </div>

        {/* User Email (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (from HubSpot)
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
            {portalInfo.userEmail || 'N/A'}
          </p>
        </div>

        {/* User Name (Editable) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          ) : (
            <p className="text-sm text-gray-900 px-3 py-2 rounded-md bg-gray-50">
              {portalInfo.userName || 'Not provided'}
            </p>
          )}
        </div>

        {/* Organization Name (Editable) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization
          </label>
          {isEditing ? (
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter organization name"
            />
          ) : (
            <p className="text-sm text-gray-900 px-3 py-2 rounded-md bg-gray-50">
              {portalInfo.organizationName || 'Not provided'}
            </p>
          )}
        </div>

        {/* Edit Form Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}