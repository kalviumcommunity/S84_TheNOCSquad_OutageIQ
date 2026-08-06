import type { AnalyticsPayload, DashboardPayload, AppUser, RegionRecord, OutageRecord } from '../types';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function login(username: string, password: string): Promise<{ token: string; user: AppUser }> {
  const response = await requestJson<{ ok: boolean; token: string; user: AppUser }>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  return { token: response.token, user: response.user };
}

export async function getOverview(): Promise<DashboardPayload> {
  const response = await requestJson<{ ok: boolean } & DashboardPayload>('/api/overview');
  return response;
}

export async function getOutages(): Promise<OutageRecord[]> {
  const response = await requestJson<{ ok: boolean; outages: OutageRecord[] }>('/api/outages');
  return response.outages;
}

export async function getRegions(): Promise<RegionRecord[]> {
  const response = await requestJson<{ ok: boolean; regions: RegionRecord[] }>('/api/regions');
  return response.regions;
}

export async function getAnalytics(): Promise<AnalyticsPayload> {
  const response = await requestJson<{ ok: boolean } & AnalyticsPayload>('/api/analytics');
  return response;
}

export async function getExportPreview(): Promise<OutageRecord[]> {
  const response = await requestJson<{ ok: boolean; prioritizedOutages: OutageRecord[] }>('/api/export');
  return response.prioritizedOutages;
}

export function apiBaseUrl() {
  return baseUrl;
}