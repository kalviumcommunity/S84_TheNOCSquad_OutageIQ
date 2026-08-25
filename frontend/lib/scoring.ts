/**
 * OutageIQ Mathematical Scoring Evaluation Engine (Frontend Client-Side Mirror)
 * ==============================================================================
 * Mirrors the exact backend scoring logic:
 * Impact Score = (0.35 × S_reach) + (0.30 × S_complaints) + (0.20 × S_revenue) + (0.15 × S_duration)
 * 
 * 1. Customer Reach (35% Weight):
 *    Normalized Reach S_reach = min(100, (subscribers / 50000) * 100)
 *    Contribution = S_reach * 0.35
 * 
 * 2. Complaint Pressure (30% Weight):
 *    Normalized Complaints S_complaints = min(100, (complaints / 2000) * 100)
 *    Contribution = S_complaints * 0.30
 * 
 * 3. Revenue Exposure (20% Weight):
 *    Regional Tier Weight (Premium=95, High=75, Mid=55, Standard=30)
 *    Contribution = S_revenue * 0.20
 * 
 * 4. Duration & Severity Escalation (15% Weight):
 *    Base (Critical=80, High=60, Medium=40, Low=20) * (1.0 + duration_hours / 10)
 *    Contribution = S_duration * 0.15
 * 
 * Priority Tier Resolution:
 *    Score >= 75.0  -> P1 (Critical) | Target SLA: 2h
 *    50.0 - 74.9    -> P2 (High)     | Target SLA: 4h
 *    25.0 - 49.9    -> P3 (Medium)   | Target SLA: 8h
 *    < 25.0         -> P3 (Low)      | Target SLA: 24h
 */

export interface ScoringInput {
  subscribers?: number;
  subscribers_affected?: number;
  complaints?: number;
  complaints_count?: number;
  duration_hours?: number;
  duration?: string | number;
  region?: string;
  region_name?: string;
  severity?: "Critical" | "High" | "Medium" | "Low" | string;
  revenue_tier?: "Premium" | "High" | "Mid" | "Standard" | string;
  revenue_exposure_hourly?: string;
}

export interface ScoringEvaluationResult {
  impact_score: number;
  priority_tier: "P1" | "P2" | "P3";
  sla_status: "BREACHED" | "AT_RISK" | "ON_TRACK";
  sla_target_hours: number;
  duration_text: string;
  revenue_tier: string;
  revenue_exposure_hourly: string;
  subscores: {
    reach: number;
    complaints: number;
    revenue: number;
    duration: number;
  };
  contributions: {
    reach: number;
    complaints: number;
    revenue: number;
    duration: number;
  };
  formula: {
    equation: string;
    calculation: string;
    tier_rule: string;
  };
  region_meta: {
    id: string;
    code: string;
    name: string;
    tier: string;
    hourly: string;
    subs: number;
  };
}

export const REGION_METADATA_MAP: Record<string, { id: string; code: string; tier: string; hourly: string; name: string; subs: number }> = {
  "mumbai": { id: "mum", code: "MUM", tier: "Premium", hourly: "₹38.5 L/hr", name: "Mumbai", subs: 4200000 },
  "delhi ncr": { id: "del", code: "DEL", tier: "Premium", hourly: "₹32.0 L/hr", name: "Delhi NCR", subs: 3800000 },
  "delhi": { id: "del", code: "DEL", tier: "Premium", hourly: "₹32.0 L/hr", name: "Delhi NCR", subs: 3800000 },
  "bangalore": { id: "blr", code: "BLR", tier: "Premium", hourly: "₹24.5 L/hr", name: "Bangalore", subs: 2900000 },
  "chennai": { id: "maa", code: "MAA", tier: "High", hourly: "₹18.0 L/hr", name: "Chennai", subs: 1800000 },
  "hyderabad": { id: "hyd", code: "HYD", tier: "High", hourly: "₹14.2 L/hr", name: "Hyderabad", subs: 2100000 },
  "pune": { id: "pun", code: "PUN", tier: "Mid", hourly: "₹9.8 L/hr", name: "Pune", subs: 1400000 },
  "kolkata": { id: "ccu", code: "CCU", tier: "Mid", hourly: "₹6.4 L/hr", name: "Kolkata", subs: 1200000 },
  "ahmedabad": { id: "amd", code: "AMD", tier: "Standard", hourly: "₹2.2 L/hr", name: "Ahmedabad", subs: 900000 },
  "jaipur": { id: "jai", code: "JAI", tier: "Standard", hourly: "₹1.1 L/hr", name: "Jaipur", subs: 800000 },
};

export function evaluateMathematicalScore(input: ScoringInput): ScoringEvaluationResult {
  const subscribers = Math.max(0, Number(input.subscribers_affected ?? input.subscribers ?? 0));
  const complaints = Math.max(0, Number(input.complaints_count ?? input.complaints ?? 0));
  
  let duration_hours = 1.0;
  if (typeof input.duration_hours === "number" && !isNaN(input.duration_hours)) {
    duration_hours = Math.max(0.1, input.duration_hours);
  } else if (typeof input.duration === "number" && !isNaN(input.duration)) {
    duration_hours = Math.max(0.1, input.duration);
  } else if (typeof input.duration === "string") {
    // Parse "3h 30m" or "3.5"
    const match = input.duration.match(/(\d+(?:\.\d+)?)\s*h(?:ours?)?(?:\s*(\d+)\s*m)?/i);
    if (match) {
      const h = parseFloat(match[1]) || 0;
      const m = parseFloat(match[2]) || 0;
      duration_hours = Math.max(0.1, h + m / 60);
    } else {
      const parsed = parseFloat(input.duration);
      if (!isNaN(parsed)) duration_hours = Math.max(0.1, parsed);
    }
  }

  const regionKey = String(input.region_name ?? input.region ?? "Mumbai").trim().toLowerCase();
  const regMeta = REGION_METADATA_MAP[regionKey] || {
    id: regionKey.slice(0, 3),
    code: regionKey.slice(0, 3).toUpperCase(),
    tier: "High",
    hourly: "₹15.0 L/hr",
    name: input.region_name ?? input.region ?? "Custom Region",
    subs: 1500000,
  };

  const revenue_tier = String(input.revenue_tier ?? regMeta.tier);
  const rawSeverity = String(input.severity ?? "Medium").trim();
  const severity = rawSeverity.charAt(0).toUpperCase() + rawSeverity.slice(1).toLowerCase();

  // 1. Customer Reach Subscore (35% weight)
  const subscore_reach = Math.min(100.0, Math.max(0.0, (subscribers / 50000.0) * 100.0));
  const reach_pts = Number((subscore_reach * 0.35).toFixed(2));

  // 2. Complaint Pressure Subscore (30% weight)
  const subscore_complaints = Math.min(100.0, Math.max(0.0, (complaints / 2000.0) * 100.0));
  const complaints_pts = Number((subscore_complaints * 0.30).toFixed(2));

  // 3. Revenue Exposure Subscore (20% weight)
  const tierMap: Record<string, number> = { Premium: 95.0, High: 75.0, Mid: 55.0, Standard: 30.0 };
  const subscore_revenue = tierMap[revenue_tier] || 70.0;
  const revenue_pts = Number((subscore_revenue * 0.20).toFixed(2));

  // 4. Duration & Severity Escalation Subscore (15% weight)
  const sevBaseMap: Record<string, number> = { Critical: 80.0, High: 60.0, Medium: 40.0, Low: 20.0 };
  const sevBase = sevBaseMap[severity] || 40.0;
  const durFactor = Math.min(1.5, 1.0 + duration_hours / 10.0);
  const subscore_duration = Math.min(100.0, Number((sevBase * durFactor).toFixed(1)));
  const duration_pts = Number((subscore_duration * 0.15).toFixed(2));

  // Composite Impact Score
  let total_score = Number((reach_pts + complaints_pts + revenue_pts + duration_pts).toFixed(1));
  total_score = Math.max(0.0, Math.min(100.0, total_score));

  // Priority Tier Resolution
  let priority_tier: "P1" | "P2" | "P3" = "P3";
  let sla_target_hours = 8.0;

  if (total_score >= 75.0) {
    priority_tier = "P1";
    sla_target_hours = 2.0;
  } else if (total_score >= 50.0) {
    priority_tier = "P2";
    sla_target_hours = 4.0;
  } else if (total_score >= 25.0) {
    priority_tier = "P3";
    sla_target_hours = 8.0;
  } else {
    priority_tier = "P3";
    sla_target_hours = 24.0;
  }

  // SLA Status Calculation
  let sla_status: "BREACHED" | "AT_RISK" | "ON_TRACK" = "ON_TRACK";
  if (duration_hours > sla_target_hours) {
    sla_status = "BREACHED";
  } else if (duration_hours >= sla_target_hours * 0.75) {
    sla_status = "AT_RISK";
  } else {
    sla_status = "ON_TRACK";
  }

  const hoursInt = Math.floor(duration_hours);
  const minsInt = Math.round((duration_hours - hoursInt) * 60);
  const duration_text = minsInt > 0 ? `${hoursInt}h ${String(minsInt).padStart(2, "0")}m` : `${hoursInt}h 00m`;

  return {
    impact_score: total_score,
    priority_tier,
    sla_status,
    sla_target_hours,
    duration_text,
    revenue_tier,
    revenue_exposure_hourly: input.revenue_exposure_hourly || regMeta.hourly,
    subscores: {
      reach: Number(subscore_reach.toFixed(1)),
      complaints: Number(subscore_complaints.toFixed(1)),
      revenue: Number(subscore_revenue.toFixed(1)),
      duration: Number(subscore_duration.toFixed(1)),
    },
    contributions: {
      reach: reach_pts,
      complaints: complaints_pts,
      revenue: revenue_pts,
      duration: duration_pts,
    },
    formula: {
      equation: "Impact Score = (0.35 × S_reach) + (0.30 × S_complaints) + (0.20 × S_revenue) + (0.15 × S_duration)",
      calculation: `(${reach_pts} pts) + ({complaints_pts} pts) + ({revenue_pts} pts) + ({duration_pts} pts) = ${total_score} / 100`,
      tier_rule: "Score >= 75.0 → P1 (Critical) | 50.0 - 74.9 → P2 (High) | 25.0 - 49.9 → P3 (Medium) | < 25.0 → P3 (Low)",
    },
    region_meta: regMeta,
  };
}
