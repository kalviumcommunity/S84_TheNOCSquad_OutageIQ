export type PageKey = 'landing' | 'login' | 'overview' | 'queue' | 'regional' | 'analytics' | 'export';

export interface OutageRecord {
  id: string;
  region: string;
  node: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Investigating' | 'Resolved';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  impactScore: number;
  subscribers: number;
  complaints: number;
  complaintVelocity: number;
  revenueExposure: string;
  duration: string;
  rootCause: string;
  reachScore: number;
  complaintScore: number;
  revenueScore: number;
  durationScore: number;
}

export interface RegionRecord {
  region: string;
  score: number;
  subscribers: string;
  tier: 'Premium' | 'High' | 'Mid';
  outages: number;
}

export interface ApiSummary {
  activeOutages: number;
  criticalOutages: number;
  impactedCustomers: string;
  avgResolutionTime: string;
  revenueAtRisk: string;
}

export interface WeeklySummary {
  totalOutages: number;
  avgResolution: string;
  revenueAtRisk: string;
  slaCompliance: number;
}

export interface DashboardPayload {
  meta: {
    product: string;
    team: string;
    release: string;
    refreshedAt: string;
  };
  summary: ApiSummary;
  outages: OutageRecord[];
  weeklySummary: WeeklySummary;
}

export interface AnalyticsPayload {
  analytics: {
    trend: Array<{ date: string; outages: number; avgImpact: number }>;
    complaintsByHour: Array<{ hour: string; complaints: number }>;
  };
  weeklySummary: WeeklySummary;
}

export interface AppUser {
  displayName: string;
  role: string;
  username: string;
}