/**
 * HubSpot Portal Service
 * Handles portal business logic and orchestrates API calls and database operations
 */

import { 
  getPortalInfoRecord, 
  updatePortalInfoRecord 
} from '@/lib/database/portal-info';
import type { PortalInfo } from './types';

export class PortalService {
  /**
   * Gets portal information, creating it if it doesn't exist
   * @param portalId - The portal ID
   * @returns Portal information from database
   */
  async getOrCreatePortalInfo(portalId: number): Promise<PortalInfo> {
    const existing = await this.getPortalInfo(portalId);
    if (existing) {
      return existing;
    }

    // Portal doesn't exist, we need an access token to create it
    // This is a placeholder - actual token should come from the caller
    throw new Error('Portal not found and no access token provided to create it');
  }

  /**
   * Gets portal information from database
   * @param portalId - The portal ID
   * @returns Portal information or null if not found
   */
  async getPortalInfo(portalId: number): Promise<PortalInfo | null> {
    try {
      const record = await getPortalInfoRecord(portalId);
      if (!record) {
        return null;
      }

      return {
        portalId: record.portal_id,
        portalName: record.portal_name,
        domain: record.domain,
        userEmail: record.user_email,
        userName: record.user_name,
        organizationName: record.organization_name,
        hubspotUserId: record.hubspot_user_id,
        hubId: record.hub_id,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      };
    } catch (error) {
      console.error(`Failed to get portal info for ${portalId}:`, error);
      throw error;
    }
  }


  /**
   * Updates portal user information
   * @param portalId - The portal ID
   * @param userData - User data to update
   * @returns Updated portal information
   */
  async updatePortalUserInfo(portalId: number, userData: {
    userEmail?: string;
    userName?: string;
    organizationName?: string;
  }): Promise<PortalInfo> {
    try {
      const record = await updatePortalInfoRecord(portalId, {
        user_email: userData.userEmail,
        user_name: userData.userName,
        organization_name: userData.organizationName
      });

      return {
        portalId: record.portal_id,
        portalName: record.portal_name,
        domain: record.domain,
        userEmail: record.user_email,
        userName: record.user_name,
        organizationName: record.organization_name,
        hubspotUserId: record.hubspot_user_id,
        hubId: record.hub_id,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      };
    } catch (error) {
      console.error(`Failed to update portal user info for ${portalId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const portalService = new PortalService();