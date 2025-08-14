export function createMockFetch(responses: Array<{
  ok: boolean;
  status?: number;
  data?: any;
  headers?: Record<string, string>;
}>) {
  const mockFetch = jest.fn();
  
  responses.forEach((response) => {
    if (response.ok) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: response.status || 200,
        headers: new Headers(response.headers || {}),
        json: () => Promise.resolve(response.data),
        text: () => Promise.resolve(JSON.stringify(response.data))
      });
    } else {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: response.status || 400,
        headers: new Headers(response.headers || {}),
        text: () => Promise.resolve('Error response')
      });
    }
  });
  
  return mockFetch;
}

// Common test scenarios
export const MOCK_SCENARIOS = {
  SUCCESS: [{ ok: true, data: { portalId: 123, domain: 'test.com' } }],
  RETRY_SUCCESS: [
    { ok: false, status: 401 },
    { ok: true, data: { portalId: 123, domain: 'test.com' } }
  ],
  RETRY_FAIL: [
    { ok: false, status: 401 },
    { ok: false, status: 401 }
  ],
  SERVER_ERROR: [{ ok: false, status: 500 }],
  NOT_FOUND: [{ ok: false, status: 404 }]
};