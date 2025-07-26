/**
 * @jest-environment node
 */

jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getCurrentEnvironment: jest.fn(() => 'dev'),
    getHubSpotConfig: jest.fn(() => ({
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost:3000/callback',
      developerApiKey: 'test-api-key',
      dateFormatterAppId: 'test-app-id'
    })),
    getSupabaseConfig: jest.fn(() => ({
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
      serviceRoleKey: 'test-service-key'
    }))
  }
}));

jest.mock('@/lib/supabase/client', () => ({
  HubSpotInstallationService: jest.fn().mockImplementation(() => ({
    findByHubId: jest.fn(),
    updateTokens: jest.fn()
  }))
}));

jest.mock('@/lib/hubspot/tokens', () => ({
  refreshAccessToken: jest.fn()
}));

jest.mock('@hubspot/api-client', () => ({
  Client: jest.fn()
}));

import { HubSpotClientManager, hubspotClientManager } from '@/lib/hubspot/client';
import { HubSpotInstallationService } from '@/lib/supabase/client';
import { refreshAccessToken } from '@/lib/hubspot/tokens';
import { Client } from '@hubspot/api-client';

const mockInstallationService = {
  findByHubId: jest.fn(),
  updateTokens: jest.fn()
};

const mockRefreshAccessToken = refreshAccessToken as jest.MockedFunction<typeof refreshAccessToken>;
const mockClient = Client as jest.MockedClass<typeof Client>;
const mockHubSpotInstallationService = HubSpotInstallationService as jest.MockedClass<typeof HubSpotInstallationService>;

describe('HubSpotClientManager', () => {
  beforeEach(() => {
    // Reset singleton instance
    (HubSpotClientManager as any).instance = null;
    
    jest.clearAllMocks();
    
    // Setup mocks
    mockHubSpotInstallationService.mockImplementation(() => mockInstallationService as any);
    
    mockInstallationService.findByHubId.mockResolvedValue({
      id: 1,
      hubId: 12345,
      accessToken: 'valid-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      scope: 'oauth',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    mockInstallationService.updateTokens.mockResolvedValue({
      id: 1,
      hubId: 12345,
      accessToken: 'new-token',
      refreshToken: 'new-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      scope: 'oauth',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    mockRefreshAccessToken.mockResolvedValue({
      accessToken: 'new-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600,
      tokenType: 'bearer'
    });
    
    mockClient.mockImplementation((config: any) => ({
      accessToken: config.accessToken,
      basePath: config.basePath
    }) as any);
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = HubSpotClientManager.getInstance();
      const instance2 = HubSpotClientManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
    
    it('should create a new instance if none exists', () => {
      const instance = HubSpotClientManager.getInstance();
      
      expect(instance).toBeInstanceOf(HubSpotClientManager);
    });
  });

  describe('getClient', () => {
    it('should create and return a HubSpot client with valid token', async () => {
      const manager = HubSpotClientManager.getInstance();
      
      const client = await manager.getClient(12345);
      
      expect(mockInstallationService.findByHubId).toHaveBeenCalledWith(12345);
      expect(mockClient).toHaveBeenCalledWith({
        accessToken: 'valid-token',
        basePath: 'https://api.hubapi.com'
      });
      expect(client).toBeDefined();
    });
    
    it('should return cached client on subsequent calls', async () => {
      const manager = HubSpotClientManager.getInstance();
      
      const client1 = await manager.getClient(12345);
      const client2 = await manager.getClient(12345);
      
      expect(client1).toBe(client2);
      expect(mockInstallationService.findByHubId).toHaveBeenCalledTimes(1);
      expect(mockClient).toHaveBeenCalledTimes(1);
    });
    
    it('should throw error when installation not found', async () => {
      mockInstallationService.findByHubId.mockResolvedValue(null);
      const manager = HubSpotClientManager.getInstance();
      
      await expect(manager.getClient(12345)).rejects.toThrow('No installation found for hub ID: 12345');
    });
    
    it('should refresh token when expired', async () => {
      mockInstallationService.findByHubId.mockResolvedValue({
        id: 1,
        hubId: 12345,
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        scope: 'oauth',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      const manager = HubSpotClientManager.getInstance();
      
      await manager.getClient(12345);
      
      expect(mockRefreshAccessToken).toHaveBeenCalledWith('refresh-token');
      expect(mockInstallationService.updateTokens).toHaveBeenCalledWith(12345, {
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
        expiresAt: expect.any(String)
      });
      expect(mockClient).toHaveBeenCalledWith({
        accessToken: 'new-token',
        basePath: 'https://api.hubapi.com'
      });
    });
    
    it('should throw error when token refresh fails', async () => {
      mockInstallationService.findByHubId.mockResolvedValue({
        id: 1,
        hubId: 12345,
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        scope: 'oauth',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      mockRefreshAccessToken.mockRejectedValue(new Error('Refresh failed'));
      const manager = HubSpotClientManager.getInstance();
      
      await expect(manager.getClient(12345)).rejects.toThrow('Failed to refresh token for hub 12345: Error: Refresh failed');
    });
    
    it('should create separate clients for different hub IDs', async () => {
      const manager = HubSpotClientManager.getInstance();
      
      const client1 = await manager.getClient(12345);
      const client2 = await manager.getClient(67890);
      
      expect(client1).not.toBe(client2);
      expect(mockInstallationService.findByHubId).toHaveBeenCalledTimes(2);
      expect(mockClient).toHaveBeenCalledTimes(2);
    });
  });
});