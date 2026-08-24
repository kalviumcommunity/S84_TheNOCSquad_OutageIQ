export interface OutageItem {
  id: string;
  shortId: string;
  region: string;
  regionCode: string;
  node: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  impactScore: number;
  status: "Open" | "In Progress" | "Active Triage" | "Resolved";
  complaints: number;
  duration: string;
  durationHours: number;
  priority: "P1" | "P2" | "P3";
  subscribers: number;
  revenueExposure: string;
  slaStatus: "BREACHED" | "AT_RISK" | "ON_TRACK";
  slaRemainingText: string;
  subscores: {
    reach: number;
    complaints: number;
    revenue: number;
    duration: number;
  };
  rootCause: string;
  services: string[];
}

export interface RegionMetric {
  id: string;
  name: string;
  subscribersFormatted: string;
  subscriberCount: number;
  impactScore: number;
  revenueTier: "Premium" | "High" | "Mid" | "Standard";
  tierBadgeColor: string;
  activeOutages: number;
  revenueExposureHourly: string;
  slaCompliance: number;
  dominantSeverity: "Critical" | "High" | "Medium" | "Low";
}

export interface PersonaInfo {
  id: string;
  name: string;
  initials: string;
  role: string;
  focus: string;
  preferredPage: string;
  preferredRoute: string;
  description: string;
}

export const PERSONAS: PersonaInfo[] = [
  {
    id: "rahul",
    name: "Rahul K.",
    initials: "RK",
    role: "NOC Engineer",
    focus: "Ranked Active Outages & Immediate Fixes",
    preferredPage: "Outage Queue",
    preferredRoute: "/queue",
    description: "Wants a ranked list of active outages, filterable by region/severity, so he knows what to fix next."
  },
  {
    id: "priya",
    name: "Priya S.",
    initials: "PS",
    role: "Regional Ops Manager",
    focus: "Regional Impact Density & SLA Compliance",
    preferredPage: "Region View",
    preferredRoute: "/regions",
    description: "Wants to see impact concentrated in her region, complaint spikes, subscriber base reach, and resolution SLAs."
  },
  {
    id: "farah",
    name: "Farah C.",
    initials: "FC",
    role: "Customer Experience Lead",
    focus: "Hourly Complaint Velocity & Proactive Comms",
    preferredPage: "Analytics",
    preferredRoute: "/analytics",
    description: "Wants to correlate complaint volume with outages to justify customer credits, track velocity spikes, and dispatch comms."
  },
  {
    id: "vikram",
    name: "Vikram D.",
    initials: "VD",
    role: "Leadership / Director",
    focus: "Weekly Exec View, Revenue at Risk & Trends",
    preferredPage: "Executive Summary / Export",
    preferredRoute: "/analytics",
    description: "Wants a weekly exec view: top 5 outages by impact, trend over time, revenue at risk (₹ Cr), and 1-click exports."
  }
];

export const INITIAL_OUTAGES: OutageItem[] = [
  {
    id: "OUT-2026-0723-N91",
    shortId: "23-N91",
    region: "Mumbai",
    regionCode: "MUM",
    node: "Node-MUM-Core-01",
    severity: "Critical",
    impactScore: 92.4,
    status: "Open",
    complaints: 1842,
    duration: "4h 12m",
    durationHours: 4.2,
    priority: "P1",
    subscribers: 42000,
    revenueExposure: "₹38.5 L/hr",
    slaStatus: "BREACHED",
    slaRemainingText: "🚨 Breached by 2h 12m",
    subscores: { reach: 88, complaints: 95, revenue: 90, duration: 72 },
    rootCause: "Core Backhaul Gateway Fiber Severance near BKC Data Hub",
    services: ["VoLTE", "5G Enterprise", "Core Data", "E911 Emergency"]
  },
  {
    id: "OUT-2026-0722-N44",
    shortId: "22-N44",
    region: "Delhi NCR",
    regionCode: "DEL",
    node: "Node-DEL-North-99",
    severity: "Critical",
    impactScore: 87.1,
    status: "Open",
    complaints: 1531,
    duration: "3h 05m",
    durationHours: 3.08,
    priority: "P1",
    subscribers: 36500,
    revenueExposure: "₹32.0 L/hr",
    slaStatus: "BREACHED",
    slaRemainingText: "🚨 Breached by 1h 05m",
    subscores: { reach: 84, complaints: 89, revenue: 88, duration: 82 },
    rootCause: "High-Capacity Edge Switch ASIC Hardware Memory Failure",
    services: ["5G Data", "VoLTE Voice", "Broadband Leased Lines"]
  },
  {
    id: "OUT-2026-0723-N12",
    shortId: "23-N12",
    region: "Bangalore",
    regionCode: "BLR",
    node: "Tower-BLR-Tech-08",
    severity: "High",
    impactScore: 74.3,
    status: "Open",
    complaints: 940,
    duration: "2h 48m",
    durationHours: 2.8,
    priority: "P2",
    subscribers: 25000,
    revenueExposure: "₹24.5 L/hr",
    slaStatus: "AT_RISK",
    slaRemainingText: "⚠️ 1h 12m remaining",
    subscores: { reach: 76, complaints: 75, revenue: 80, duration: 64 },
    rootCause: "Microwave Link Misalignment & Heavy Atmospheric Rain Fade",
    services: ["4G/5G Cellular", "Enterprise VPN"]
  },
  {
    id: "OUT-2026-0721-N88",
    shortId: "21-N88",
    region: "Chennai",
    regionCode: "MAA",
    node: "Node-MAA-Edge-44",
    severity: "High",
    impactScore: 68.9,
    status: "In Progress",
    complaints: 710,
    duration: "5h 30m",
    durationHours: 5.5,
    priority: "P2",
    subscribers: 18000,
    revenueExposure: "₹18.0 L/hr",
    slaStatus: "BREACHED",
    slaRemainingText: "🚨 Breached by 1h 30m",
    subscores: { reach: 68, complaints: 70, revenue: 72, duration: 62 },
    rootCause: "Power Grid Substation Surge & Battery Bank Voltage Drop",
    services: ["VoLTE Voice", "4G Data Services"]
  },
  {
    id: "OUT-2026-0723-N03",
    shortId: "23-N03",
    region: "Hyderabad",
    regionCode: "HYD",
    node: "Tower-HYD-HITEC-12",
    severity: "High",
    impactScore: 61.7,
    status: "Open",
    complaints: 580,
    duration: "3h 20m",
    durationHours: 3.33,
    priority: "P2",
    subscribers: 15000,
    revenueExposure: "₹14.2 L/hr",
    slaStatus: "AT_RISK",
    slaRemainingText: "⚠️ 40m remaining",
    subscores: { reach: 62, complaints: 64, revenue: 60, duration: 58 },
    rootCause: "5G RAN Carrier Aggregation Synchronization Delay",
    services: ["5G Ultra Broadband", "VoLTE"]
  },
  {
    id: "OUT-2026-0722-N55",
    shortId: "22-N55",
    region: "Pune",
    regionCode: "PUN",
    node: "Tower-PUN-IT-02",
    severity: "Medium",
    impactScore: 55.2,
    status: "In Progress",
    complaints: 420,
    duration: "1h 55m",
    durationHours: 1.92,
    priority: "P2",
    subscribers: 11000,
    revenueExposure: "₹9.8 L/hr",
    slaStatus: "ON_TRACK",
    slaRemainingText: "⏱️ 6h 05m remaining",
    subscores: { reach: 54, complaints: 55, revenue: 58, duration: 52 },
    rootCause: "Localized Distribution Box Thermal Sensor Trip",
    services: ["4G LTE", "Fixed Broadband"]
  },
  {
    id: "OUT-2026-0720-N66",
    shortId: "20-N66",
    region: "Kolkata",
    regionCode: "CCU",
    node: "Node-CCU-Central-05",
    severity: "Medium",
    impactScore: 44.8,
    status: "In Progress",
    complaints: 290,
    duration: "6h 10m",
    durationHours: 6.17,
    priority: "P3",
    subscribers: 8500,
    revenueExposure: "₹6.4 L/hr",
    slaStatus: "ON_TRACK",
    slaRemainingText: "⏱️ 1h 50m remaining",
    subscores: { reach: 42, complaints: 45, revenue: 48, duration: 44 },
    rootCause: "Secondary Metro Fiber Ring Maintenance Delay",
    services: ["3G/4G Data"]
  },
  {
    id: "OUT-2026-0721-N29",
    shortId: "21-N29",
    region: "Ahmedabad",
    regionCode: "AMD",
    node: "Tower-AMD-West-19",
    severity: "Low",
    impactScore: 31.4,
    status: "Resolved",
    complaints: 140,
    duration: "0h 50m",
    durationHours: 0.83,
    priority: "P3",
    subscribers: 3200,
    revenueExposure: "₹2.2 L/hr",
    slaStatus: "ON_TRACK",
    slaRemainingText: "✓ Resolved in SLA",
    subscores: { reach: 30, complaints: 32, revenue: 34, duration: 28 },
    rootCause: "Optical Transceiver Module Swap Completed",
    services: ["Cellular Voice", "SMS Gateway"]
  },
  {
    id: "OUT-2026-0722-N77",
    shortId: "22-N77",
    region: "Jaipur",
    regionCode: "JAI",
    node: "Tower-JAI-North-03",
    severity: "Low",
    impactScore: 22.6,
    status: "Resolved",
    complaints: 88,
    duration: "1h 15m",
    durationHours: 1.25,
    priority: "P3",
    subscribers: 1800,
    revenueExposure: "₹1.1 L/hr",
    slaStatus: "ON_TRACK",
    slaRemainingText: "✓ Resolved in SLA",
    subscores: { reach: 22, complaints: 20, revenue: 24, duration: 24 },
    rootCause: "Scheduled Maintenance & Security Firmware Patch",
    services: ["2G/4G Basic Services"]
  }
];

export const REGIONS_DATA: RegionMetric[] = [
  {
    id: "mum",
    name: "Mumbai",
    subscribersFormatted: "4.2M subscribers",
    subscriberCount: 4200000,
    impactScore: 92,
    revenueTier: "Premium",
    tierBadgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    activeOutages: 4,
    revenueExposureHourly: "₹45.2 L/hr",
    slaCompliance: 82,
    dominantSeverity: "Critical"
  },
  {
    id: "del",
    name: "Delhi NCR",
    subscribersFormatted: "3.8M subscribers",
    subscriberCount: 3800000,
    impactScore: 87,
    revenueTier: "Premium",
    tierBadgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    activeOutages: 3,
    revenueExposureHourly: "₹38.0 L/hr",
    slaCompliance: 85,
    dominantSeverity: "Critical"
  },
  {
    id: "blr",
    name: "Bangalore",
    subscribersFormatted: "2.9M subscribers",
    subscriberCount: 2900000,
    impactScore: 74,
    revenueTier: "Premium",
    tierBadgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    activeOutages: 3,
    revenueExposureHourly: "₹28.4 L/hr",
    slaCompliance: 89,
    dominantSeverity: "High"
  },
  {
    id: "hyd",
    name: "Hyderabad",
    subscribersFormatted: "2.1M subscribers",
    subscriberCount: 2100000,
    impactScore: 62,
    revenueTier: "High",
    tierBadgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    activeOutages: 2,
    revenueExposureHourly: "₹18.5 L/hr",
    slaCompliance: 91,
    dominantSeverity: "High"
  },
  {
    id: "maa",
    name: "Chennai",
    subscribersFormatted: "1.8M subscribers",
    subscriberCount: 1800000,
    impactScore: 69,
    revenueTier: "High",
    tierBadgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    activeOutages: 2,
    revenueExposureHourly: "₹16.2 L/hr",
    slaCompliance: 88,
    dominantSeverity: "High"
  },
  {
    id: "pun",
    name: "Pune",
    subscribersFormatted: "1.4M subscribers",
    subscriberCount: 1400000,
    impactScore: 55,
    revenueTier: "Mid",
    tierBadgeColor: "bg-gray-100 text-gray-700 border-gray-200",
    activeOutages: 2,
    revenueExposureHourly: "₹11.0 L/hr",
    slaCompliance: 94,
    dominantSeverity: "Medium"
  },
  {
    id: "ccu",
    name: "Kolkata",
    subscribersFormatted: "1.2M subscribers",
    subscriberCount: 1200000,
    impactScore: 45,
    revenueTier: "Mid",
    tierBadgeColor: "bg-gray-100 text-gray-700 border-gray-200",
    activeOutages: 1,
    revenueExposureHourly: "₹8.4 L/hr",
    slaCompliance: 96,
    dominantSeverity: "Medium"
  },
  {
    id: "amd",
    name: "Ahmedabad",
    subscribersFormatted: "0.9M subscribers",
    subscriberCount: 900000,
    impactScore: 31,
    revenueTier: "Standard",
    tierBadgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    activeOutages: 1,
    revenueExposureHourly: "₹4.1 L/hr",
    slaCompliance: 98,
    dominantSeverity: "Low"
  }
];

export const HOURLY_COMPLAINTS = [
  { hour: "06:00", count: 95 },
  { hour: "08:00", count: 340 },
  { hour: "10:00", count: 580 },
  { hour: "12:00", count: 720 },
  { hour: "14:00", count: 610 },
  { hour: "16:00", count: 840 },
  { hour: "18:00", count: 1120 },
  { hour: "20:00", count: 1350 },
  { hour: "22:00", count: 980 }
];

export const SEVEN_DAY_TREND = [
  { date: "Jul 17", volume: 8, avgImpact: 52 },
  { date: "Jul 18", volume: 11, avgImpact: 58 },
  { date: "Jul 19", volume: 9, avgImpact: 55 },
  { date: "Jul 20", volume: 14, avgImpact: 67 },
  { date: "Jul 21", volume: 12, avgImpact: 62 },
  { date: "Jul 22", volume: 16, avgImpact: 71 },
  { date: "Jul 23", volume: 24, avgImpact: 75 }
];
