import { OutageItem, RegionMetric, INITIAL_OUTAGES, REGIONS_DATA } from "./data";

export interface AnalyticsData {
  kpis: {
    active_outages: number;
    critical_count: number;
    customers_impacted: string;
    avg_resolution_time: string;
    revenue_at_risk: string;
    sla_compliance_rate: string;
  };
  hourly_complaints: { hour: string; count: number }[];
  seven_day_trend: { date: string; volume: number; avgImpact: number }[];
  severity_distribution: Record<string, number>;
}

export function mapRowToOutageItem(row: any): OutageItem {
  return {
    id: row.outage_id || row.id,
    shortId: row.short_id || row.shortId || (row.outage_id ? row.outage_id.split("-").slice(-2).join("-") : "N/A"),
    region: row.region_name || row.region,
    regionCode: row.region_code || row.regionCode || (row.region_name ? row.region_name.substring(0, 3).toUpperCase() : "REG"),
    node: row.node_id || row.node,
    severity: (row.severity || "Medium") as any,
    impactScore: typeof row.impact_score === "number" ? row.impact_score : (row.impactScore || 50),
    status: (row.status || "Open") as any,
    complaints: row.complaints_count ?? row.complaints ?? 0,
    duration: row.duration_text || row.duration || "1h 00m",
    durationHours: row.duration_hours || row.durationHours || 1.0,
    priority: (row.priority_tier || row.priority || "P2") as any,
    subscribers: row.subscribers_affected ?? row.subscribers ?? 10000,
    revenueExposure: row.revenue_exposure_hourly || row.revenueExposure || "₹10.0 L/hr",
    slaStatus: (row.sla_status || row.slaStatus || "ON_TRACK") as any,
    slaRemainingText: row.sla_target_hours ? `${row.sla_target_hours}h target` : "3h remaining",
    subscores: {
      reach: row.subscore_reach ?? (row.subscores ? row.subscores.reach : 60),
      complaints: row.subscore_complaints ?? (row.subscores ? row.subscores.complaints : 60),
      revenue: row.subscore_revenue ?? (row.subscores ? row.subscores.revenue : 60),
      duration: row.subscore_duration ?? (row.subscores ? row.subscores.duration : 60),
    },
    rootCause: row.root_cause || row.rootCause || "Under Investigation",
    services: row.affected_services ? row.affected_services.split("/") : (row.services || ["5G Data", "VoLTE"]),
  };
}

export async function fetchOutages(params?: { region?: string; severity?: string; status?: string; sort?: string }): Promise<OutageItem[]> {
  const qs = new URLSearchParams();
  if (params?.region && params.region !== "ALL") qs.set("region", params.region);
  if (params?.severity && params.severity !== "ALL") qs.set("severity", params.severity);
  if (params?.status && params.status !== "ALL") qs.set("status", params.status);
  if (params?.sort) qs.set("sort", params.sort);

  const endpoint = `/api/outages${qs.toString() ? `?${qs.toString()}` : ""}`;

  try {
    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.outages)) {
        return data.outages.map(mapRowToOutageItem);
      }
    }
  } catch (_) {
    try {
      const res2 = await fetch(`http://localhost:8000${endpoint}`);
      if (res2.ok) {
        const data = await res2.json();
        if (Array.isArray(data.outages)) {
          return data.outages.map(mapRowToOutageItem);
        }
      }
    } catch (_) {}
  }

  return INITIAL_OUTAGES;
}

export async function escalateOutageApi(outageId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/outages/${outageId}/escalate`, { method: "POST" });
    if (res.ok) return true;
  } catch (_) {
    try {
      const res2 = await fetch(`http://localhost:8000/api/outages/${outageId}/escalate`, { method: "POST" });
      if (res2.ok) return true;
    } catch (_) {}
  }
  return false;
}

export async function assignOutageApi(outageId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/outages/${outageId}/assign`, { method: "POST" });
    if (res.ok) return true;
  } catch (_) {
    try {
      const res2 = await fetch(`http://localhost:8000/api/outages/${outageId}/assign`, { method: "POST" });
      if (res2.ok) return true;
    } catch (_) {}
  }
  return false;
}

export async function fetchRegions(): Promise<RegionMetric[]> {
  try {
    const res = await fetch("/api/regions");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.regions)) {
        return data.regions.map((r: any) => ({
          id: r.region_id || r.id,
          name: r.name,
          subscribersFormatted: r.subscribers_formatted || `${(r.subscribers_count / 1000000).toFixed(1)}M subscribers`,
          subscriberCount: r.subscribers_count || 1000000,
          impactScore: r.impact_score || 50,
          revenueTier: r.revenue_tier || "High",
          tierBadgeColor: r.revenue_tier === "Premium" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800",
          activeOutages: r.active_outages || 1,
          revenueExposureHourly: r.revenue_exposure_hourly || "₹10.0 L/hr",
          slaCompliance: r.sla_compliance || 90,
          dominantSeverity: r.dominant_severity || "High",
        }));
      }
    }
  } catch (_) {
    try {
      const res2 = await fetch("http://localhost:8000/api/regions");
      if (res2.ok) {
        const data = await res2.json();
        if (Array.isArray(data.regions)) {
          return data.regions.map((r: any) => ({
            id: r.region_id || r.id,
            name: r.name,
            subscribersFormatted: r.subscribers_formatted || `${(r.subscribers_count / 1000000).toFixed(1)}M subscribers`,
            subscriberCount: r.subscribers_count || 1000000,
            impactScore: r.impact_score || 50,
            revenueTier: r.revenue_tier || "High",
            tierBadgeColor: r.revenue_tier === "Premium" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800",
            activeOutages: r.active_outages || 1,
            revenueExposureHourly: r.revenue_exposure_hourly || "₹10.0 L/hr",
            slaCompliance: r.sla_compliance || 90,
            dominantSeverity: r.dominant_severity || "High",
          }));
        }
      }
    } catch (_) {}
  }
  return REGIONS_DATA;
}

export async function fetchAnalytics(): Promise<AnalyticsData | null> {
  try {
    const res = await fetch("/api/analytics");
    if (res.ok) return await res.json();
  } catch (_) {
    try {
      const res2 = await fetch("http://localhost:8000/api/analytics");
      if (res2.ok) return await res2.json();
    } catch (_) {}
  }
  return null;
}

export async function fetchExecutiveSummary(): Promise<any | null> {
  try {
    const res = await fetch("/api/executive-summary");
    if (res.ok) return await res.json();
  } catch (_) {
    try {
      const res2 = await fetch("http://localhost:8000/api/executive-summary");
      if (res2.ok) return await res2.json();
    } catch (_) {}
  }
  return null;
}

export async function createOutageApi(outageData: any): Promise<{ success: boolean; outage?: OutageItem; message?: string; evaluation?: any }> {
  const payload = {
    ...outageData,
    user_role: "leadership",
  };

  try {
    const res = await fetch("/api/outages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer leadership-exec" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        outage: data.outage ? mapRowToOutageItem(data.outage) : undefined,
        message: data.message,
        evaluation: data.evaluation,
      };
    }
  } catch (_) {
    try {
      const res2 = await fetch("http://localhost:8000/api/outages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer leadership-exec" },
        body: JSON.stringify(payload),
      });
      if (res2.ok) {
        const data = await res2.json();
        return {
          success: true,
          outage: data.outage ? mapRowToOutageItem(data.outage) : undefined,
          message: data.message,
          evaluation: data.evaluation,
        };
      }
    } catch (_) {}
  }

  return { success: false, message: "Failed to connect to backend server" };
}

export async function createBatchOutagesApi(
  outagesOrCsv: { outages?: any[]; csv_data?: string }
): Promise<{ success: boolean; count?: number; message?: string; created_records?: any[] }> {
  const payload = {
    ...outagesOrCsv,
    user_role: "leadership",
  };

  try {
    const res = await fetch("/api/outages/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer leadership-exec" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (_) {
    try {
      const res2 = await fetch("http://localhost:8000/api/outages/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer leadership-exec" },
        body: JSON.stringify(payload),
      });
      if (res2.ok) {
        return await res2.json();
      }
    } catch (_) {}
  }

  return { success: false, message: "Batch ingestion failed to connect to backend server" };
}

export async function evaluateScoreApi(inputData: any): Promise<any> {
  try {
    const res = await fetch("/api/evaluate-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputData),
    });
    if (res.ok) return await res.json();
  } catch (_) {
    try {
      const res2 = await fetch("http://localhost:8000/api/evaluate-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
      if (res2.ok) return await res2.json();
    } catch (_) {}
  }
  return null;
}

export async function resetDatabaseApi(): Promise<boolean> {
  try {
    const res = await fetch("/api/reset-data", { method: "POST" });
    if (res.ok) return true;
  } catch (_) {
    try {
      const res2 = await fetch("http://localhost:8000/api/reset-data", { method: "POST" });
      if (res2.ok) return true;
    } catch (_) {}
  }
  return false;
}

