export interface RestrictedRouteInfo {
  route: string;
  title: string;
  reason: string;
  permittedRoles: string[];
}

export interface UserAccount {
  id: string;
  userId: string;
  aliases: string[];
  password: string;
  name: string;
  initials: string;
  role: string;
  roleBadgeColor: string;
  roleType: "noc_engineer" | "regional_ops" | "cx_lead" | "leadership";
  department: string;
  jobTitle: string;
  jobSummary: string;
  keyResponsibilities: string[];
  primaryRoute: string;
  primaryRouteName: string;
  allowedRoutes: string[];
  restrictedRoutes: RestrictedRouteInfo[];
  allowedNavItems: {
    name: string;
    href: string;
    aliases: string[];
    iconName: "LayoutGrid" | "Zap" | "Globe" | "TrendingUp" | "Download" | "MessageSquare" | "Shield" | "Database" | "PlusCircle" | "Sparkles";
    badge?: string;
  }[];
  visibleFilters: {
    showPriority: boolean;
    showStatus: boolean;
    showRegionSelect: boolean;
    showNodeSearch: boolean;
    showServiceFilter: boolean;
    showRevenueTier: boolean;
  };
  themeColor: {
    primary: string;
    border: string;
    bgBadge: string;
    textBadge: string;
  };
}

export const USER_ACCOUNTS: UserAccount[] = [
  {
    id: "rahul",
    userId: "rahul.noc",
    aliases: ["rahul", "rahul.noc", "rahul@outageiq.internal", "noc_engineer"],
    password: "noc@123",
    name: "Rahul K.",
    initials: "RK",
    role: "NOC Engineer",
    roleBadgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    roleType: "noc_engineer",
    department: "Network Operations Center (NOC) Tier-1/2",
    jobTitle: "NOC Operations Engineer & Incident Dispatch Lead",
    jobSummary: "Responsible for 24/7 real-time monitoring of live network alarms, rapid technical outage triage, identifying optical fiber and hardware switch failures, triggering emergency P1 field escalations, and assigning Tier-3 optical leads.",
    keyResponsibilities: [
      "Real-time monitoring of active network alerts and live telemetry across all circles",
      "Prioritizing outages based on composite Impact Score (0–100)",
      "Triggering emergency P1 technician dispatches for critical fiber breaks and core switch failures",
      "Assigning Tier-3 optical hardware leads to active incidents",
      "Tracking incident lifecycle states (Open, Active Triage, In Progress, Resolved)"
    ],
    primaryRoute: "/queue",
    primaryRouteName: "Outage Queue",
    allowedRoutes: ["/queue", "/outage-queue", "/overview", "/"],
    restrictedRoutes: [
      {
        route: "/ingest",
        title: "Executive Data Ingestion & Scoring Engine",
        reason: "Adding new raw outage telemetry, manual incident records, and CSV bulk data ingestion into SQLite is strictly restricted to the Executive Director.",
        permittedRoles: ["Leadership / Director"]
      },
      {
        route: "/analytics",
        title: "Executive Trend & Financial Analytics",
        reason: "Macro financial forecasting, weekly corporate trend curves, and revenue-at-risk calculations are restricted to Executive Leadership and Customer Experience leads.",
        permittedRoles: ["Leadership / Director", "Customer Experience Lead"]
      },
      {
        route: "/regions",
        title: "Regional Strategy & Market Ops",
        reason: "Regional circle strategic resource allocation and circle SLA policy management are restricted to Regional Ops Managers and Leadership.",
        permittedRoles: ["Regional Ops Manager", "Leadership / Director"]
      },
      {
        route: "/export",
        title: "Executive PDF Incident Briefings",
        reason: "Confidential executive boardroom PDF report generation is restricted to Leadership & Executive Directors.",
        permittedRoles: ["Leadership / Director"]
      }
    ],
    allowedNavItems: [
      {
        name: "Outage Queue",
        href: "/queue",
        aliases: ["/queue", "/outage-queue"],
        iconName: "Zap",
        badge: "Primary Action"
      },
      {
        name: "Live Overview",
        href: "/overview",
        aliases: ["/", "/overview"],
        iconName: "LayoutGrid"
      }
    ],
    visibleFilters: {
      showPriority: true,
      showStatus: true,
      showRegionSelect: true,
      showNodeSearch: true,
      showServiceFilter: false,
      showRevenueTier: false
    },
    themeColor: {
      primary: "#8B5CF6",
      border: "border-purple-500/40",
      bgBadge: "bg-purple-500/20",
      textBadge: "text-purple-300"
    }
  },
  {
    id: "priya",
    userId: "priya.ops",
    aliases: ["priya", "priya.ops", "priya@outageiq.internal", "regional_ops"],
    password: "ops@123",
    name: "Priya S.",
    initials: "PS",
    role: "Regional Ops Manager",
    roleBadgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    roleType: "regional_ops",
    department: "Regional Network Operations & Circle Management",
    jobTitle: "Regional Operations Manager (Geographic Circles)",
    jobSummary: "Responsible for geographic circle network reliability, circle-by-circle SLA compliance tracking, subscriber reach density analysis, regional revenue exposure monitoring, and regional field engineering dispatch coordination.",
    keyResponsibilities: [
      "Monitoring geographic impact density and health rankings across 9 telecom circles",
      "Tracking circle SLA compliance rates and deadline breach countdowns",
      "Managing regional revenue tier classifications (Premium, High, Mid, Standard)",
      "Coordinating circle field engineering resources and maintenance schedules",
      "Reviewing circle-specific incident drilldowns and root causes"
    ],
    primaryRoute: "/regions",
    primaryRouteName: "Region View",
    allowedRoutes: ["/regions", "/region-view", "/queue", "/outage-queue", "/overview", "/"],
    restrictedRoutes: [
      {
        route: "/ingest",
        title: "Executive Data Ingestion & Scoring Engine",
        reason: "Ingesting raw outage alerts and executing CSV bulk imports into the SQLite database is strictly restricted to the Executive Director.",
        permittedRoles: ["Leadership / Director"]
      },
      {
        route: "/analytics",
        title: "Executive Trend & Financial Analytics",
        reason: "Corporate macro 7-day trend analysis, executive financial forecasts, and high-level revenue modeling are restricted to Executive Leadership.",
        permittedRoles: ["Leadership / Director", "Customer Experience Lead"]
      },
      {
        route: "/export",
        title: "Executive PDF Incident Briefings",
        reason: "Board-level confidential PDF incident briefing downloads are restricted to Executive Leadership.",
        permittedRoles: ["Leadership / Director"]
      }
    ],
    allowedNavItems: [
      {
        name: "Region View",
        href: "/regions",
        aliases: ["/regions", "/region-view"],
        iconName: "Globe",
        badge: "Geo Hub"
      },
      {
        name: "Regional Queue",
        href: "/queue",
        aliases: ["/queue", "/outage-queue"],
        iconName: "Zap"
      },
      {
        name: "Circle Overview",
        href: "/overview",
        aliases: ["/", "/overview"],
        iconName: "LayoutGrid"
      }
    ],
    visibleFilters: {
      showPriority: true,
      showStatus: true,
      showRegionSelect: true,
      showNodeSearch: true,
      showServiceFilter: false,
      showRevenueTier: true
    },
    themeColor: {
      primary: "#3B82F6",
      border: "border-blue-500/40",
      bgBadge: "bg-blue-500/20",
      textBadge: "text-blue-300"
    }
  },
  {
    id: "farah",
    userId: "farah.cx",
    aliases: ["farah", "farah.cx", "farah@outageiq.internal", "cx_lead"],
    password: "cx@123",
    name: "Farah C.",
    initials: "FC",
    role: "Customer Experience Lead",
    roleBadgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    roleType: "cx_lead",
    department: "Customer Experience, Support & Communications",
    jobTitle: "Customer Experience Lead & Incident Communications",
    jobSummary: "Responsible for protecting customer sentiment during disruptions, tracking hourly complaint velocity spikes across support channels (Call Center, App, Web, Social), calculating customer SLA credit eligibility, and dispatching proactive broadcast alerts.",
    keyResponsibilities: [
      "Monitoring hourly inbound complaint velocity vs active network outage timelines",
      "Tracking subscriber reach and identifying high-churn risk circles",
      "Formulating customer credit payback justifications and retention strategies",
      "Dispatching proactive customer broadcast notifications via SMS, Push, and Web App alerts",
      "Safeguarding telecom Net Promoter Score (NPS) during major service disruptions"
    ],
    primaryRoute: "/analytics",
    primaryRouteName: "CX & Complaint Analytics",
    allowedRoutes: ["/analytics", "/overview", "/"],
    restrictedRoutes: [
      {
        route: "/ingest",
        title: "Executive Data Ingestion & Scoring Engine",
        reason: "Adding new telemetry records, running mathematical scoring evaluations, and committing data to SQLite is reserved for the Executive Director.",
        permittedRoles: ["Leadership / Director"]
      },
      {
        route: "/regions",
        title: "Regional Physical Infrastructure Topology",
        reason: "Low-level circle physical engineering topology and maintenance rosters are restricted to Regional Ops Managers.",
        permittedRoles: ["Regional Ops Manager", "Leadership / Director"]
      },
      {
        route: "/queue",
        title: "Technical NOC Hardware Queue & Dispatch",
        reason: "Hardware switch reconfiguration and optical technician dispatch actions are reserved for NOC Engineers.",
        permittedRoles: ["NOC Engineer", "Regional Ops Manager"]
      },
      {
        route: "/export",
        title: "Executive PDF Incident Briefings",
        reason: "Formal executive board briefing PDF generation is reserved for Executive Leadership.",
        permittedRoles: ["Leadership / Director"]
      }
    ],
    allowedNavItems: [
      {
        name: "CX Analytics",
        href: "/analytics",
        aliases: ["/analytics"],
        iconName: "TrendingUp",
        badge: "Complaint Hub"
      },
      {
        name: "Customer Overview",
        href: "/overview",
        aliases: ["/", "/overview"],
        iconName: "LayoutGrid"
      }
    ],
    visibleFilters: {
      showPriority: true,
      showStatus: true,
      showRegionSelect: true,
      showNodeSearch: false,
      showServiceFilter: true,
      showRevenueTier: false
    },
    themeColor: {
      primary: "#10B981",
      border: "border-emerald-500/40",
      bgBadge: "bg-emerald-500/20",
      textBadge: "text-emerald-300"
    }
  },
  {
    id: "vikram",
    userId: "vikram.exec",
    aliases: ["vikram", "vikram.exec", "vikram@outageiq.internal", "leadership", "director"],
    password: "exec@123",
    name: "Vikram D.",
    initials: "VD",
    role: "Leadership / Director",
    roleBadgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    roleType: "leadership",
    department: "Executive Leadership & Network Infrastructure VP Office",
    jobTitle: "Executive Director / VP of Network Infrastructure",
    jobSummary: "Directs overarching network reliability strategy, possesses exclusive authorization to ingest new outage records (manually or via bulk CSV), evaluates transparent mathematical scoring equations into SQLite, reviews 7-day rolling volume curves, and generates 1-click executive PDF briefings.",
    keyResponsibilities: [
      "Ingesting new outage incident data manually or via bulk CSV with live mathematical evaluation",
      "Evaluating 4-factor scoring logic and committing persistent records to SQLite database",
      "Reviewing macro 7-day outage volume trajectories and average Impact Score velocity",
      "Monitoring aggregate enterprise Revenue at Risk (₹42.3 Cr) across operating circles",
      "Tracking quarterly SLA compliance scorecards and downloading formal executive PDF briefings"
    ],
    primaryRoute: "/analytics",
    primaryRouteName: "Executive Summary",
    allowedRoutes: ["/ingest", "/data-intake", "/analytics", "/export", "/exportable-data", "/regions", "/region-view", "/overview", "/"],
    restrictedRoutes: [
      {
        route: "/queue",
        title: "Tactical NOC Technician Dispatch Queue",
        reason: "Granular technician tickbox assignment is an operational task handled by NOC Engineers.",
        permittedRoles: ["NOC Engineer", "Regional Ops Manager"]
      }
    ],
    allowedNavItems: [
      {
        name: "Data Ingestion",
        href: "/ingest",
        aliases: ["/ingest", "/data-intake"],
        iconName: "Database",
        badge: "Exec Ingress"
      },
      {
        name: "Executive Summary",
        href: "/analytics",
        aliases: ["/analytics"],
        iconName: "TrendingUp",
        badge: "Exec View"
      },
      {
        name: "Export Reports",
        href: "/export",
        aliases: ["/export", "/exportable-data"],
        iconName: "Download",
        badge: "PDF / CSV"
      },
      {
        name: "Circle Strategy",
        href: "/regions",
        aliases: ["/regions", "/region-view"],
        iconName: "Globe"
      },
      {
        name: "Macro Overview",
        href: "/overview",
        aliases: ["/", "/overview"],
        iconName: "LayoutGrid"
      }
    ],
    visibleFilters: {
      showPriority: true,
      showStatus: true,
      showRegionSelect: true,
      showNodeSearch: false,
      showServiceFilter: false,
      showRevenueTier: true
    },
    themeColor: {
      primary: "#F59E0B",
      border: "border-amber-500/40",
      bgBadge: "bg-amber-500/20",
      textBadge: "text-amber-300"
    }
  }
];

export function findUserByCredentials(usernameOrId: string, passwordAttempt: string): UserAccount | null {
  const cleanId = usernameOrId.trim().toLowerCase();
  const cleanPw = passwordAttempt.trim();

  const user = USER_ACCOUNTS.find(
    (u) =>
      u.userId.toLowerCase() === cleanId ||
      u.id.toLowerCase() === cleanId ||
      u.aliases.some((a) => a.toLowerCase() === cleanId)
  );

  if (!user) return null;

  if (user.password === cleanPw) {
    return user;
  }

  return null;
}

export function getUserById(idOrUserId: string): UserAccount | undefined {
  const clean = idOrUserId.trim().toLowerCase();
  return USER_ACCOUNTS.find(
    (u) =>
      u.id.toLowerCase() === clean ||
      u.userId.toLowerCase() === clean ||
      u.aliases.some((a) => a.toLowerCase() === clean)
  );
}

export function isPathAllowedForUser(user: UserAccount | null, pathname: string): boolean {
  if (!user) return false;
  if (pathname === "/login") return true;

  // Clean pathname trailing slashes
  const path = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  return user.allowedRoutes.some((route) => {
    const r = route.endsWith("/") && route.length > 1 ? route.slice(0, -1) : route;
    return path === r || path.startsWith(r + "/");
  });
}
