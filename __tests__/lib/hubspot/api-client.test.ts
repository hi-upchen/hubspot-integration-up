import { withTokenRetry } from '@/lib/hubspot/api-client';

// Mock the token manager
jest.mock('@/lib/hubspot/token-manager', () => ({
  tokenManager: {
    getValidToken: jest.fn()
  }
}));

import { tokenManager } from '@/lib/hubspot/token-manager';

const mockGetValidToken = tokenManager.getValidToken as jest.MockedFunction<typeof tokenManager.getValidToken>;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withTokenRetry', () => {
    it('should return result on successful API call', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'success' });

      const result = await withTokenRetry(mockApiCall, 123, 'date-formatter');

      expect(result).toEqual({ data: 'success' });
      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(mockGetValidToken).not.toHaveBeenCalled();
    });

    it('should retry once on 401 error', async () => {
      const error401 = new Error('Unauthorized') as any;
      error401.status = 401;

      const mockApiCall = jest.fn()
        .mockRejectedValueOnce(error401)
        .mockResolvedValueOnce({ data: 'success after retry' });

      mockGetValidToken.mockResolvedValue('new-token');

      const result = await withTokenRetry(mockApiCall, 123, 'date-formatter');

      expect(result).toEqual({ data: 'success after retry' });
      expect(mockApiCall).toHaveBeenCalledTimes(2);
      expect(mockGetValidToken).toHaveBeenCalledWith(123, 'date-formatter', { forceRefresh: true });
    });

    it('should not retry on non-401 errors', async () => {
      const error500 = new Error('Server Error') as any;
      error500.status = 500;

      const mockApiCall = jest.fn().mockRejectedValue(error500);

      await expect(withTokenRetry(mockApiCall, 123, 'date-formatter'))
        .rejects.toThrow('Server Error');

      expect(mockApiCall).toHaveBeenCalledTimes(1);
      expect(mockGetValidToken).not.toHaveBeenCalled();
    });

    it('should not retry indefinitely on persistent 401', async () => {
      const error401 = new Error('Persistent Unauthorized') as any;
      error401.status = 401;

      const mockApiCall = jest.fn().mockRejectedValue(error401);
      mockGetValidToken.mockResolvedValue('new-token');

      await expect(withTokenRetry(mockApiCall, 123, 'date-formatter'))
        .rejects.toThrow('Persistent Unauthorized');

      expect(mockApiCall).toHaveBeenCalledTimes(2); // Original + 1 retry
      expect(mockGetValidToken).toHaveBeenCalledTimes(1);
    });

    it('should work with different app types', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'url-shortener-success' });

      const result = await withTokenRetry(mockApiCall, 456, 'url-shortener');

      expect(result).toEqual({ data: 'url-shortener-success' });
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should handle token refresh failures during retry', async () => {
      const error401 = new Error('Unauthorized') as any;
      error401.status = 401;

      const mockApiCall = jest.fn().mockRejectedValue(error401);
      mockGetValidToken.mockRejectedValue(new Error('Token refresh failed'));

      await expect(withTokenRetry(mockApiCall, 123, 'date-formatter'))
        .rejects.toThrow('Token refresh failed');

      expect(mockApiCall).toHaveBeenCalledTimes(1); // Only original call
      expect(mockGetValidToken).toHaveBeenCalledTimes(1);
    });
  });
});