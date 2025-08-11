import { Client } from '@hubspot/api-client';
import { HubSpotInstallationService } from '../supabase/client';
import { refreshAccessToken } from './tokens';

export class HubSpotClientManager {
  private static instance: HubSpotClientManager;
  private clients: Map<number, Client> = new Map();
  private installationService = new HubSpotInstallationService();

  private constructor() {}

  static getInstance(): HubSpotClientManager {
    if (!HubSpotClientManager.instance) {
      HubSpotClientManager.instance = new HubSpotClientManager();
    }
    return HubSpotClientManager.instance;
  }

  // Legacy method - gets client for any app (uses most recent installation)
  async getClient(hubId: number): Promise<Client> {
    const cachedClient = this.clients.get(hubId);
    if (cachedClient) {
      return cachedClient;
    }

    const installation = await this.installationService.findByHubId(hubId);
    if (!installation) {
      throw new Error(`No installation found for hub ID: ${hubId}`);
    }

    const now = new Date();
    const expiresAt = new Date(installation.expiresAt);

    let accessToken = installation.accessToken;

    if (now >= expiresAt) {
      try {
        // Use the stored app_type from the installation record
        const refreshedTokens = await refreshAccessToken(installation.refreshToken, installation.appType);
        const updatedInstallation = await this.installationService.updateTokensForApp(hubId, installation.appType, {
          accessToken: refreshedTokens.accessToken,
          refreshToken: refreshedTokens.refreshToken,
          expiresAt: new Date(Date.now() + refreshedTokens.expiresIn * 1000).toISOString()
        });
        accessToken = updatedInstallation.accessToken;
      } catch (error) {
        throw new Error(`Failed to refresh token for hub ${hubId}: ${error}`);
      }
    }

    const client = new Client({
      accessToken,
      basePath: 'https://api.hubapi.com'
    });

    this.clients.set(hubId, client);
    return client;
  }

  // New method - gets client for specific app
  async getClientForApp(hubId: number, appType: 'date-formatter' | 'url-shortener'): Promise<Client> {
    const clientKey = `${hubId}-${appType}`;
    const cachedClient = this.clients.get(clientKey as any);
    if (cachedClient) {
      return cachedClient;
    }

    const installation = await this.installationService.findByHubIdAndApp(hubId, appType);
    if (!installation) {
      throw new Error(`No ${appType} installation found for hub ID: ${hubId}`);
    }

    const now = new Date();
    const expiresAt = new Date(installation.expiresAt);

    let accessToken = installation.accessToken;

    if (now >= expiresAt) {
      try {
        const refreshedTokens = await refreshAccessToken(installation.refreshToken, appType);
        const updatedInstallation = await this.installationService.updateTokensForApp(hubId, appType, {
          accessToken: refreshedTokens.accessToken,
          refreshToken: refreshedTokens.refreshToken,
          expiresAt: new Date(Date.now() + refreshedTokens.expiresIn * 1000).toISOString()
        });
        accessToken = updatedInstallation.accessToken;
      } catch (error) {
        throw new Error(`Failed to refresh ${appType} token for hub ${hubId}: ${error}`);
      }
    }

    const client = new Client({
      accessToken,
      basePath: 'https://api.hubapi.com'
    });

    this.clients.set(clientKey as any, client);
    return client;
  }

}

export const hubspotClientManager = HubSpotClientManager.getInstance();