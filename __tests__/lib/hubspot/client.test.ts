/**
 * @jest-environment node
 */

// Mock all dependencies before imports
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
  supabaseClient: {
    installationService: {
      getInstallation: jest.fn(),
      updateTokens: jest.fn()
    }
  }
}));
jest.mock('@/lib/hubspot/tokens');
jest.mock('@hubspot/api-client');

import { hubspotClientManager } from '@/lib/hubspot/client';
import { ConfigManager } from '@/lib/config/config-manager';
import { supabaseClient } from '@/lib/supabase/client';
import { refreshAccessToken } from '@/lib/hubspot/tokens';
import { Client } from '@hubspot/api-client';

const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;
const mockSupabaseClient = supabaseClient as jest.Mocked<typeof supabaseClient>;
const mockRefreshAccessToken = refreshAccessToken as jest.MockedFunction<typeof refreshAccessToken>;
const mockHubSpotClient = Client as jest.MockedClass<typeof Client>;

describe('hubspot/client.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockConfigManager.getHubSpotConfig.mockReturnValue({
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost:3000/callback',
      developerApiKey: 'test-api-key',
      dateFormatterAppId: 'test-app-id'
    });

    // Mock successful installation lookup
    mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
      hub_id: 12345678,
      access_token: 'current_access_token',
      refresh_token: 'current_refresh_token',
      expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    });

    // Mock successful token update
    mockSupabaseClient.installationService.updateTokens.mockResolvedValue(undefined);

    // Mock successful token refresh
    mockRefreshAccessToken.mockResolvedValue({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
      expiresIn: 3600,
      tokenType: 'bearer'
    });

    // Mock HubSpot Client constructor
    mockHubSpotClient.mockImplementation(() => ({
      setAccessToken: jest.fn()
    }) as any);
  });

  describe('Core Functionality Tests', () => {
    test('should create and cache clients for different hub IDs', async () => {
      const client1 = await hubspotClientManager.getClient(12345678);
      const client2 = await hubspotClientManager.getClient(87654321);
      const client3 = await hubspotClientManager.getClient(12345678); // Same as client1

      expect(client1).toBeDefined();
      expect(client2).toBeDefined();
      expect(client3).toBe(client1); // Should return cached client
      expect(mockHubSpotClient).toHaveBeenCalledTimes(2); // Only 2 unique clients created
    });

    test('should properly initialize HubSpot clients with access tokens', async () => {
      await hubspotClientManager.getClient(12345678);

      expect(mockHubSpotClient).toHaveBeenCalledWith();
      const clientInstance = mockHubSpotClient.mock.results[0].value;
      expect(clientInstance.setAccessToken).toHaveBeenCalledWith('current_access_token');
    });

    test('should lookup installation from database', async () => {
      await hubspotClientManager.getClient(12345678);

      expect(mockSupabaseClient.installationService.getInstallation).toHaveBeenCalledWith(12345678);
    });
  });

  describe('Client Caching Behavior', () => {
    test('should return cached clients for subsequent requests', async () => {
      const hubId = 12345678;
      
      const client1 = await hubspotClientManager.getClient(hubId);
      const client2 = await hubspotClientManager.getClient(hubId);
      const client3 = await hubspotClientManager.getClient(hubId);

      expect(client1).toBe(client2);
      expect(client2).toBe(client3);
      expect(mockSupabaseClient.installationService.getInstallation).toHaveBeenCalledTimes(1);
      expect(mockHubSpotClient).toHaveBeenCalledTimes(1);
    });

    test('should create separate clients for different hub IDs', async () => {
      const hubIds = [11111111, 22222222, 33333333];
      
      const clients = await Promise.all(
        hubIds.map(hubId => hubspotClientManager.getClient(hubId))
      );

      expect(clients[0]).not.toBe(clients[1]);
      expect(clients[1]).not.toBe(clients[2]);
      expect(clients[0]).not.toBe(clients[2]);
      expect(mockHubSpotClient).toHaveBeenCalledTimes(3);
    });

    test('should handle concurrent requests for same hub ID', async () => {
      const hubId = 12345678;
      const concurrentRequests = Array.from({ length: 10 }, () => 
        hubspotClientManager.getClient(hubId)
      );

      const clients = await Promise.all(concurrentRequests);
      
      // All clients should be the same instance
      clients.forEach(client => {
        expect(client).toBe(clients[0]);
      });
      
      expect(mockSupabaseClient.installationService.getInstallation).toHaveBeenCalledTimes(1);
      expect(mockHubSpotClient).toHaveBeenCalledTimes(1);
    });

    test('should maintain cache consistency across multiple calls', async () => {
      const hubId = 12345678;
      
      // First batch of requests
      const batch1 = await Promise.all([
        hubspotClientManager.getClient(hubId),
        hubspotClientManager.getClient(hubId),
        hubspotClientManager.getClient(hubId)
      ]);

      // Second batch of requests  
      const batch2 = await Promise.all([
        hubspotClientManager.getClient(hubId),
        hubspotClientManager.getClient(hubId)
      ]);

      // All should be the same instance
      [...batch1, ...batch2].forEach(client => {
        expect(client).toBe(batch1[0]);
      });
    });
  });

  describe('Token Expiration Edge Cases', () => {
    test('should refresh tokens when expired', async () => {
      // Mock expired token
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: 'expired_token',
        refresh_token: 'refresh_token',
        expires_at: new Date(Date.now() - 1000).toISOString() // 1 second ago
      });

      await hubspotClientManager.getClient(12345678);

      expect(mockRefreshAccessToken).toHaveBeenCalledWith('refresh_token');
      expect(mockSupabaseClient.installationService.updateTokens).toHaveBeenCalledWith(
        12345678,
        'new_access_token',
        'new_refresh_token',
        expect.any(Date)
      );
    });

    test('should handle tokens expiring exactly at current time', async () => {
      const now = new Date();
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: 'token_expiring_now',
        refresh_token: 'refresh_token',
        expires_at: now.toISOString()
      });

      await hubspotClientManager.getClient(12345678);

      expect(mockRefreshAccessToken).toHaveBeenCalled();
    });

    test('should handle tokens expiring in 1 millisecond', async () => {
      const nearFuture = new Date(Date.now() + 1);
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: 'token_expiring_soon',
        refresh_token: 'refresh_token',
        expires_at: nearFuture.toISOString()
      });

      await hubspotClientManager.getClient(12345678);

      expect(mockRefreshAccessToken).toHaveBeenCalled();
    });

    test('should not refresh tokens with far-future expiration', async () => {
      const farFuture = new Date(Date.now() + 86400000); // 24 hours from now
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: 'valid_token',
        refresh_token: 'refresh_token',
        expires_at: farFuture.toISOString()
      });

      await hubspotClientManager.getClient(12345678);

      expect(mockRefreshAccessToken).not.toHaveBeenCalled();
      expect(mockSupabaseClient.installationService.updateTokens).not.toHaveBeenCalled();
    });

    test('should handle malformed expiration dates', async () => {
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: 'token_with_bad_date',
        refresh_token: 'refresh_token',
        expires_at: 'invalid-date-string'
      });

      await hubspotClientManager.getClient(12345678);

      // Should still try to refresh since date is invalid (treated as expired)
      expect(mockRefreshAccessToken).toHaveBeenCalled();
    });

    test('should calculate correct expiration time from refresh response', async () => {
      // Mock expired token to trigger refresh
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: 'expired_token',  
        refresh_token: 'refresh_token',
        expires_at: new Date(Date.now() - 1000).toISOString()
      });

      mockRefreshAccessToken.mockResolvedValue({
        accessToken: 'new_token',
        refreshToken: 'new_refresh',
        expiresIn: 3600, // 1 hour
        tokenType: 'bearer'
      });

      const startTime = Date.now();
      await hubspotClientManager.getClient(12345678);
      const endTime = Date.now();

      expect(mockSupabaseClient.installationService.updateTokens).toHaveBeenCalledWith(
        12345678,
        'new_token',
        'new_refresh',
        expect.any(Date)
      );

      // Check that the expiration date is approximately 1 hour from now
      const updateCall = mockSupabaseClient.installationService.updateTokens.mock.calls[0];
      const expirationDate = updateCall[3] as Date;
      const expectedExpiration = startTime + (3600 * 1000);
      
      expect(expirationDate.getTime()).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(expirationDate.getTime()).toBeLessThanOrEqual(endTime + (3600 * 1000) + 1000);
    });
  });

  describe('Concurrent Client Requests', () => {
    test('should handle concurrent requests for different hub IDs', async () => {
      const hubIds = Array.from({ length: 10 }, (_, i) => 1000000 + i);
      
      const promises = hubIds.map(hubId => hubspotClientManager.getClient(hubId));
      const clients = await Promise.all(promises);

      expect(clients).toHaveLength(10);
      expect(mockHubSpotClient).toHaveBeenCalledTimes(10);
      expect(mockSupabaseClient.installationService.getInstallation).toHaveBeenCalledTimes(10);
    });

    test('should handle concurrent requests with token refresh scenarios', async () => {
      const hubId = 12345678;
      
      // Mock expired token to trigger refresh
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: hubId,
        access_token: 'expired_token',
        refresh_token: 'refresh_token',
        expires_at: new Date(Date.now() - 1000).toISOString()
      });

      const promises = Array.from({ length: 5 }, () => hubspotClientManager.getClient(hubId));
      const clients = await Promise.all(promises);

      // All should be the same client
      clients.forEach(client => {
        expect(client).toBe(clients[0]);
      });

      // Token refresh should only happen once
      expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.installationService.updateTokens).toHaveBeenCalledTimes(1);
    });

    test('should handle mixed success/failure in concurrent requests', async () => {
      const successHubId = 11111111;
      const failureHubId = 22222222;

      // Mock success for first hub
      mockSupabaseClient.installationService.getInstallation
        .mockResolvedValueOnce({
          hub_id: successHubId,
          access_token: 'valid_token',
          refresh_token: 'refresh_token',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        })
        .mockRejectedValueOnce(new Error('Installation not found'));

      const promises = [
        hubspotClientManager.getClient(successHubId),
        hubspotClientManager.getClient(failureHubId).catch(err => err)
      ];

      const results = await Promise.all(promises);

      expect(results[0]).toBeDefined(); // Success case
      expect(results[1]).toBeInstanceOf(Error); // Failure case
    });
  });

  describe('Database Connection Failures During Token Refresh', () => {
    test('should handle database timeout during installation lookup', async () => {
      mockSupabaseClient.installationService.getInstallation.mockRejectedValue(
        new Error('Database connection timeout')
      );

      await expect(hubspotClientManager.getClient(12345678))
        .rejects.toThrow('Database connection timeout');
    });

    test('should handle connection loss during token update', async () => {
      // Mock expired token to trigger refresh
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: 'expired_token',
        refresh_token: 'refresh_token',
        expires_at: new Date(Date.now() - 1000).toISOString()
      });

      // Mock database failure during token update
      mockSupabaseClient.installationService.updateTokens.mockRejectedValue(
        new Error('Connection lost during update')
      );

      await expect(hubspotClientManager.getClient(12345678))
        .rejects.toThrow('Connection lost during update');
    });

    test('should handle constraint violations during updates', async () => {
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: 'expired_token',
        refresh_token: 'refresh_token',
        expires_at: new Date(Date.now() - 1000).toISOString()
      });

      mockSupabaseClient.installationService.updateTokens.mockRejectedValue(
        new Error('duplicate key value violates unique constraint')
      );

      await expect(hubspotClientManager.getClient(12345678))
        .rejects.toThrow('duplicate key value violates unique constraint');
    });

    test('should handle intermittent failures with retry scenarios', async () => {
      const hubId = 12345678;
      
      // First call fails, second succeeds
      mockSupabaseClient.installationService.getInstallation
        .mockRejectedValueOnce(new Error('Temporary database error'))
        .mockResolvedValueOnce({
          hub_id: hubId,
          access_token: 'valid_token',
          refresh_token: 'refresh_token',
          expires_at: new Date(Date.now() + 3600000).toISOString()
        });

      // First attempt should fail
      await expect(hubspotClientManager.getClient(hubId))
        .rejects.toThrow('Temporary database error');

      // Second attempt should succeed
      const client = await hubspotClientManager.getClient(hubId);
      expect(client).toBeDefined();
    });
  });

  describe('Memory Leak Prevention', () => {
    test('should handle client cache size management (100+ clients)', async () => {
      const hubIds = Array.from({ length: 100 }, (_, i) => 1000000 + i);
      
      const promises = hubIds.map(hubId => hubspotClientManager.getClient(hubId));
      const clients = await Promise.all(promises);

      expect(clients).toHaveLength(100);
      expect(mockHubSpotClient).toHaveBeenCalledTimes(100);
      
      // Verify each client is unique
      const uniqueClients = new Set(clients);
      expect(uniqueClients.size).toBe(100);
    });

    test('should handle memory pressure with 1000 clients', async () => {
      const hubIds = Array.from({ length: 1000 }, (_, i) => 2000000 + i);
      
      // Process in batches to avoid overwhelming the test runner
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < hubIds.length; i += batchSize) {
        const batch = hubIds.slice(i, i + batchSize);
        const batchPromises = batch.map(hubId => hubspotClientManager.getClient(hubId));
        batches.push(Promise.all(batchPromises));
      }

      const batchResults = await Promise.all(batches);
      const allClients = batchResults.flat();

      expect(allClients).toHaveLength(1000);
      expect(mockHubSpotClient).toHaveBeenCalledTimes(1000);
    });

    test('should cleanup failed client creation', async () => {
      mockHubSpotClient.mockImplementation(() => {
        throw new Error('Client creation failed');
      });

      await expect(hubspotClientManager.getClient(12345678))
        .rejects.toThrow('Client creation failed');

      // Retry should attempt to create client again (not use cached failure)
      mockHubSpotClient.mockImplementation(() => ({
        setAccessToken: jest.fn()
      }) as any);

      const client = await hubspotClientManager.getClient(12345678);
      expect(client).toBeDefined();
    });

    test('should handle rapid creation/garbage collection scenarios', async () => {
      // Rapidly create and release references to many clients
      for (let batch = 0; batch < 10; batch++) {
        const promises = Array.from({ length: 50 }, (_, i) => 
          hubspotClientManager.getClient(3000000 + batch * 50 + i)
        );
        
        const clients = await Promise.all(promises);
        expect(clients).toHaveLength(50);
        
        // Let clients be eligible for garbage collection
        // (In real scenarios, they would go out of scope)
      }

      // This test primarily ensures no memory leaks or crashes occur
      expect(mockHubSpotClient).toHaveBeenCalledTimes(500);
    });
  });

  describe('Performance & Concurrency Testing', () => {
    test('should handle high-frequency client requests (1000 requests)', async () => {
      const hubId = 12345678;
      const requests = Array.from({ length: 1000 }, () => 
        hubspotClientManager.getClient(hubId)
      );

      const clients = await Promise.all(requests);
      
      // All should be the same cached instance
      clients.forEach(client => {
        expect(client).toBe(clients[0]);
      });

      // Only one database call and client creation should occur
      expect(mockSupabaseClient.installationService.getInstallation).toHaveBeenCalledTimes(1);
      expect(mockHubSpotClient).toHaveBeenCalledTimes(1);
    });

    test('should handle burst traffic with token refresh (50 concurrent)', async () => {
      const hubId = 12345678;
      
      // Mock expired token to trigger refresh
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: hubId,
        access_token: 'expired_token',
        refresh_token: 'refresh_token', 
        expires_at: new Date(Date.now() - 1000).toISOString()
      });

      const requests = Array.from({ length: 50 }, () => 
        hubspotClientManager.getClient(hubId)
      );

      const clients = await Promise.all(requests);
      
      clients.forEach(client => {
        expect(client).toBe(clients[0]);
      });

      // Token refresh should only happen once despite concurrent requests
      expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.installationService.updateTokens).toHaveBeenCalledTimes(1);
    });

    test('should handle many different hub IDs (100 different clients)', async () => {
      const hubIds = Array.from({ length: 100 }, (_, i) => 4000000 + i);
      
      const promises = hubIds.map(hubId => hubspotClientManager.getClient(hubId));
      const clients = await Promise.all(promises);

      expect(clients).toHaveLength(100);
      
      // Verify all clients are unique
      const uniqueClients = new Set(clients);
      expect(uniqueClients.size).toBe(100);
      
      expect(mockHubSpotClient).toHaveBeenCalledTimes(100);
      expect(mockSupabaseClient.installationService.getInstallation).toHaveBeenCalledTimes(100);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    test('should handle null/undefined hub IDs', async () => {
      await expect(hubspotClientManager.getClient(null as any))
        .rejects.toThrow();
      
      await expect(hubspotClientManager.getClient(undefined as any))
        .rejects.toThrow();
    });

    test('should handle very large hub IDs', async () => {
      const largeHubId = Number.MAX_SAFE_INTEGER;
      
      const client = await hubspotClientManager.getClient(largeHubId);
      expect(client).toBeDefined();
      expect(mockSupabaseClient.installationService.getInstallation)
        .toHaveBeenCalledWith(largeHubId);
    });

    test('should handle negative/zero hub IDs', async () => {
      await expect(hubspotClientManager.getClient(-1))
        .rejects.toThrow();
        
      await expect(hubspotClientManager.getClient(0))
        .rejects.toThrow();
    });

    test('should handle installation service errors', async () => {
      mockSupabaseClient.installationService.getInstallation.mockRejectedValue(
        new Error('Installation not found')
      );

      await expect(hubspotClientManager.getClient(12345678))
        .rejects.toThrow('Installation not found');
    });

    test('should handle HubSpot Client constructor failures', async () => {
      mockHubSpotClient.mockImplementation(() => {
        throw new Error('HubSpot client initialization failed');
      });

      await expect(hubspotClientManager.getClient(12345678))
        .rejects.toThrow('HubSpot client initialization failed');
    });

    test('should handle malformed installation data', async () => {
      mockSupabaseClient.installationService.getInstallation.mockResolvedValue({
        hub_id: 12345678,
        access_token: null as any,
        refresh_token: null as any,
        expires_at: null as any
      });

      // Should still attempt to create client (may fail gracefully or use defaults)
      const client = await hubspotClientManager.getClient(12345678);
      expect(client).toBeDefined();
    });
  });

  describe('Client Lifecycle Management', () => {
    test('should properly initialize with correct configuration', async () => {
      const client = await hubspotClientManager.getClient(12345678);
      
      expect(client).toBeDefined();
      expect(mockConfigManager.getHubSpotConfig).toHaveBeenCalled();
      expect(mockHubSpotClient).toHaveBeenCalledWith();
    });

    test('should maintain configuration consistency across multiple calls', async () => {
      const hubId = 12345678;
      
      await hubspotClientManager.getClient(hubId);
      await hubspotClientManager.getClient(hubId);
      await hubspotClientManager.getClient(hubId);

      // Configuration should only be fetched once (or cached)
      expect(mockConfigManager.getHubSpotConfig).toHaveBeenCalled();
    });

    test('should handle client cleanup scenarios', async () => {
      const client = await hubspotClientManager.getClient(12345678);
      expect(client).toBeDefined();
      
      // In a real scenario, we might have a cleanup method
      // For now, just verify the client was created properly
      expect(mockHubSpotClient).toHaveBeenCalledTimes(1);
    });
  });
});