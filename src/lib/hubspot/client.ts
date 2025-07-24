import { Client } from '@hubspot/api-client';
import type { HubSpotClientConfig } from '../types';
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
        const refreshedTokens = await refreshAccessToken(installation.refreshToken);
        const updatedInstallation = await this.installationService.updateTokens(hubId, {
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

  removeClient(hubId: number): void {
    this.clients.delete(hubId);
  }

  async createClientWithToken(accessToken: string): Promise<Client> {
    return new Client({
      accessToken,
      basePath: 'https://api.hubapi.com'
    });
  }
}

export const hubspotClientManager = HubSpotClientManager.getInstance();