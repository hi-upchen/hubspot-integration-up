/**
 * @jest-environment node
 */

import { Pool } from 'pg';
import { PostgresClient } from '@/lib/database/postgres-client';
import { ConfigManager } from '@/lib/config/config-manager';

// Mock pg module
jest.mock('pg', () => ({
  Pool: jest.fn()
}));

// Mock ConfigManager
jest.mock('@/lib/config/config-manager');

const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;
const MockPool = Pool as jest.MockedClass<typeof Pool>;

describe('PostgresClient', () => {
  let mockPoolInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear the singleton instance
    (PostgresClient as any).instance = undefined;
    
    // Create mock pool instance
    mockPoolInstance = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
      on: jest.fn()
    };
    
    MockPool.mockImplementation(() => mockPoolInstance);
    
    // Mock config
    mockConfigManager.getConfig.mockReturnValue({
      hubspot: {} as any,
      supabase: {
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
        serviceRoleKey: 'test-service-key',
        postgres: {
          pooledConnectionString: 'postgresql://test:password@test.pooler.supabase.com:6543/postgres?pgbouncer=true'
        }
      },
      application: {} as any
    });
  });

  describe('getPool', () => {
    it('should create a new pool on first call', () => {
      const pool = PostgresClient.getPool();
      
      expect(MockPool).toHaveBeenCalledTimes(1);
      expect(MockPool).toHaveBeenCalledWith({
        connectionString: 'postgresql://test:password@test.pooler.supabase.com:6543/postgres?pgbouncer=true',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      });
      expect(pool).toBe(mockPoolInstance);
    });

    it('should return the same pool instance on subsequent calls', () => {
      const pool1 = PostgresClient.getPool();
      const pool2 = PostgresClient.getPool();
      
      expect(MockPool).toHaveBeenCalledTimes(1);
      expect(pool1).toBe(pool2);
    });

    it('should throw error if postgres config is missing', () => {
      mockConfigManager.getConfig.mockReturnValue({
        hubspot: {} as any,
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
          serviceRoleKey: 'test-service-key'
        } as any,
        application: {} as any
      });
      
      expect(() => PostgresClient.getPool()).toThrow('PostgreSQL connection string not configured');
    });

    it('should throw error if connection string is empty', () => {
      mockConfigManager.getConfig.mockReturnValue({
        hubspot: {} as any,
        supabase: {
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
          serviceRoleKey: 'test-service-key',
          postgres: {
            pooledConnectionString: ''
          }
        },
        application: {} as any
      });
      
      expect(() => PostgresClient.getPool()).toThrow('PostgreSQL connection string not configured');
    });
  });

  describe('query', () => {
    it('should execute query through the pool', async () => {
      const mockResult = {
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1
      };
      mockPoolInstance.query.mockResolvedValue(mockResult);
      
      const pool = PostgresClient.getPool();
      const result = await pool.query('SELECT * FROM test WHERE id = $1', [1]);
      
      expect(mockPoolInstance.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      expect(result).toBe(mockResult);
    });

    it('should handle query errors', async () => {
      const error = new Error('Query failed');
      mockPoolInstance.query.mockRejectedValue(error);
      
      const pool = PostgresClient.getPool();
      
      await expect(pool.query('SELECT * FROM test')).rejects.toThrow('Query failed');
    });
  });

  describe('connect', () => {
    it('should get a client from the pool', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };
      mockPoolInstance.connect.mockResolvedValue(mockClient);
      
      const pool = PostgresClient.getPool();
      const client = await pool.connect();
      
      expect(mockPoolInstance.connect).toHaveBeenCalled();
      expect(client).toBe(mockClient);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockPoolInstance.connect.mockRejectedValue(error);
      
      const pool = PostgresClient.getPool();
      
      await expect(pool.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('end', () => {
    it('should close the pool and clear the singleton', async () => {
      mockPoolInstance.end.mockResolvedValue(undefined);
      
      const pool = PostgresClient.getPool();
      await PostgresClient.end();
      
      expect(mockPoolInstance.end).toHaveBeenCalled();
      expect((PostgresClient as any).instance).toBeUndefined();
      
      // Should create a new pool after end
      const newPool = PostgresClient.getPool();
      expect(MockPool).toHaveBeenCalledTimes(2);
      expect(newPool).toBe(mockPoolInstance); // Same mock instance in test
    });

    it('should handle gracefully if pool does not exist', async () => {
      await expect(PostgresClient.end()).resolves.toBeUndefined();
    });
  });
});