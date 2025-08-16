/**
 * @jest-environment node
 */

import { GET, HEAD } from '@/app/api/health/route';
import { ConfigManager } from '@/lib/config/config-manager';

// Mock ConfigManager
jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getCurrentEnvironment: jest.fn(),
    getConfig: jest.fn(),
    getConfigSource: jest.fn(),
  },
}));

const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
    mockConfigManager.getConfigSource.mockReturnValue('file');
  });

  describe('GET /api/health', () => {
    test('should return healthy status when configuration is valid', async () => {
      mockConfigManager.getConfig.mockReturnValue({} as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        status: 'healthy',
        environment: 'dev',
        config: {
          source: 'file',
          valid: true
        },
        services: {
          hubspot: 'configured',
          database: 'configured'
        }
      });
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test('should return error status when configuration loading fails', async () => {
      mockConfigManager.getConfig.mockImplementation(() => {
        throw new Error('Configuration not found');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        status: 'error',
        environment: 'dev',
        config: {
          source: 'none',
          valid: false
        },
        services: {
          hubspot: 'unavailable',
          database: 'unavailable'
        },
        error: 'Configuration not available'
      });
    });

    test('should handle environment detection errors', async () => {
      mockConfigManager.getCurrentEnvironment.mockImplementation(() => {
        throw new Error('Environment detection failed');
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        status: 'error',
        environment: 'unknown',
        config: {
          source: 'none',
          valid: false
        },
        error: 'System error'
      });
    });

    test('should return different environments correctly', async () => {
      mockConfigManager.getCurrentEnvironment.mockReturnValue('prod');
      mockConfigManager.getConfigSource.mockReturnValue('environment');
      mockConfigManager.getConfig.mockReturnValue({} as any);

      const response = await GET();
      const data = await response.json();

      expect(data.environment).toBe('prod');
      expect(data.config.source).toBe('environment');
    });

    test('should not expose sensitive information', async () => {
      mockConfigManager.getConfig.mockReturnValue({} as any);

      const response = await GET();
      const data = await response.json();

      // Should not expose
      expect(data).not.toHaveProperty('configPath');
      expect(data).not.toHaveProperty('environmentVariable');
      expect(data).not.toHaveProperty('credentials');
      expect(data).not.toHaveProperty('secrets');
      expect(data).not.toHaveProperty('clientId');
      expect(data).not.toHaveProperty('clientSecret');

      // Should only expose safe information
      expect(data.environment).toMatch(/^(dev|prod|unknown)$/);
      expect(data.config.source).toMatch(/^(environment|file|none)$/);
      expect(typeof data.config.valid).toBe('boolean');
    });
  });

  describe('HEAD /api/health', () => {
    test('should return 200 when configuration is valid', async () => {
      mockConfigManager.getConfig.mockReturnValue({} as any);

      const response = await HEAD();

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    test('should return 500 when configuration is invalid', async () => {
      mockConfigManager.getConfig.mockImplementation(() => {
        throw new Error('Configuration not found');
      });

      const response = await HEAD();

      expect(response.status).toBe(500);
      expect(response.body).toBeNull();
    });
  });

  describe('Security Tests', () => {
    test('should never expose environment variable names', async () => {
      mockConfigManager.getConfig.mockReturnValue({} as any);

      const response = await GET();
      const data = await response.json();
      const responseText = JSON.stringify(data);

      expect(responseText).not.toContain('VERCEL_DEV_CONFIG_JSON');
      expect(responseText).not.toContain('VERCEL_PROD_CONFIG_JSON');
    });

    test('should never expose file paths', async () => {
      mockConfigManager.getConfig.mockReturnValue({} as any);

      const response = await GET();
      const data = await response.json();
      const responseText = JSON.stringify(data);

      expect(responseText).not.toContain('config/credentials');
      expect(responseText).not.toContain('.json');
      expect(responseText).not.toContain('/Users/');
      expect(responseText).not.toContain('C:\\');
    });

    test('should never expose configuration values', async () => {
      mockConfigManager.getConfig.mockReturnValue({
        hubspot: {
          apps: {
            'date-formatter': {
              clientId: 'secret_client_id',
              clientSecret: 'secret_client_secret'
            }
          }
        }
      } as any);

      const response = await GET();
      const data = await response.json();
      const responseText = JSON.stringify(data);

      expect(responseText).not.toContain('secret_client_id');
      expect(responseText).not.toContain('secret_client_secret');
    });

    test('should have consistent response structure for both success and error', async () => {
      // Test success response structure
      mockConfigManager.getConfig.mockReturnValue({} as any);
      const successResponse = await GET();
      const successData = await successResponse.json();

      expect(successData).toHaveProperty('status');
      expect(successData).toHaveProperty('environment');
      expect(successData).toHaveProperty('config');
      expect(successData).toHaveProperty('services');
      expect(successData).toHaveProperty('timestamp');

      // Test error response structure
      mockConfigManager.getConfig.mockImplementation(() => {
        throw new Error('Config error');
      });
      const errorResponse = await GET();
      const errorData = await errorResponse.json();

      expect(errorData).toHaveProperty('status');
      expect(errorData).toHaveProperty('environment');
      expect(errorData).toHaveProperty('config');
      expect(errorData).toHaveProperty('services');
      expect(errorData).toHaveProperty('timestamp');
      expect(errorData).toHaveProperty('error');
    });
  });
});