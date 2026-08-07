import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  login,
  getOverview,
  getOutages,
  getRegions,
  getAnalytics,
  getExportPreview,
  apiBaseUrl,
} from './api';

describe('API Client Utility', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('apiBaseUrl returns configured base URL', () => {
    expect(apiBaseUrl()).toBe('http://localhost:5050');
  });

  it('login sends credentials and returns token and user info', async () => {
    const mockUser = { username: 'rahul', displayName: 'Rahul K.', role: 'NOC Engineer' };
    const mockResponse = { ok: true, token: 'demo-token', user: mockUser };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await login('rahul', 'outageiq-demo');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5050/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'rahul', password: 'outageiq-demo' }),
    });
    expect(result).toEqual({ token: 'demo-token', user: mockUser });
  });

  it('login throws an error when server returns non-ok status', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ ok: false, message: 'Invalid demo credentials' }),
    });

    await expect(login('baduser', 'badpass')).rejects.toThrow('Invalid demo credentials');
  });

  it('getOverview fetches overview dashboard data', async () => {
    const mockOverview = {
      ok: true,
      summary: { activeOutages: 5 },
      outages: [],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOverview,
    });

    const data = await getOverview();
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5050/api/overview', expect.any(Object));
    expect(data).toEqual(mockOverview);
  });

  it('getOutages fetches outages array', async () => {
    const mockOutages = [{ id: 'OUT-1', region: 'Mumbai', impactScore: 90 }];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, outages: mockOutages }),
    });

    const outages = await getOutages();
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5050/api/outages', expect.any(Object));
    expect(outages).toEqual(mockOutages);
  });

  it('getRegions fetches regions array', async () => {
    const mockRegions = [{ region: 'Delhi', score: 85 }];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, regions: mockRegions }),
    });

    const regions = await getRegions();
    expect(regions).toEqual(mockRegions);
  });

  it('getAnalytics fetches analytics data', async () => {
    const mockAnalytics = { analytics: { trend: [] }, weeklySummary: { totalOutages: 10 } };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, ...mockAnalytics }),
    });

    const result = await getAnalytics();
    expect(result).toEqual({ ok: true, ...mockAnalytics });
  });

  it('getExportPreview fetches prioritized outages for export', async () => {
    const mockOutages = [{ id: 'OUT-1', region: 'Mumbai' }];

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, prioritizedOutages: mockOutages }),
    });

    const result = await getExportPreview();
    expect(result).toEqual(mockOutages);
  });
});
