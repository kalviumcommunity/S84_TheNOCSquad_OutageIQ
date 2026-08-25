"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Zap,
  Globe,
  TrendingUp,
  Download,
  Clock,
  RotateCcw,
  LogOut,
  Shield,
  Search,
  CheckCircle2,
  Lock,
  Database,
  PlusCircle,
  Sparkles,
  Layers
} from "lucide-react";
import { useFilter } from "@/context/FilterContext";
import { useAuth } from "@/context/AuthContext";

export interface SidebarProps {
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  selectedPriority?: string;
  onPriorityChange?: (priority: string) => void;
  statusFilter?: { open: boolean; inProgress: boolean; resolved: boolean };
  onStatusChange?: (status: { open: boolean; inProgress: boolean; resolved: boolean }) => void;
  priorityCounts?: { p1: number; p2: number; p3: number };
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
}

export default function Sidebar({
  selectedRegion: propRegion,
  onRegionChange: propOnRegionChange,
  selectedPriority: propPriority,
  onPriorityChange: propOnPriorityChange,
  statusFilter: propStatusFilter,
  onStatusChange: propOnStatusChange,
  priorityCounts: propPriorityCounts,
  hasActiveFilters: propHasActiveFilters,
  onResetFilters: propOnResetFilters,
}: SidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const filterContext = useFilter();
  const { user, logout } = useAuth();

  const selectedRegion = propRegion !== undefined ? propRegion : filterContext.selectedRegion;
  const onRegionChange = propOnRegionChange ?? filterContext.setSelectedRegion;

  const selectedPriority = propPriority !== undefined ? propPriority : filterContext.selectedPriority;
  const onPriorityChange = propOnPriorityChange ?? filterContext.setSelectedPriority;

  const statusFilter = propStatusFilter !== undefined ? propStatusFilter : filterContext.statusFilter;
  const onStatusChange = propOnStatusChange ?? filterContext.setStatusFilter;

  const priorityCounts = propPriorityCounts !== undefined ? propPriorityCounts : filterContext.priorityCounts;

  const hasActiveFilters = propHasActiveFilters !== undefined ? propHasActiveFilters : filterContext.hasActiveFilters;
  const onResetFilters = propOnResetFilters ?? filterContext.resetFilters;

  // Icon map for dynamic nav items
  const iconMap: Record<string, React.ElementType> = {
    LayoutGrid,
    Zap,
    Globe,
    TrendingUp,
    Download,
    Shield,
    Database,
    PlusCircle,
    Sparkles,
    Layers
  };

  // If user is authenticated, use their role-permitted nav items; otherwise fallback to default
  const navItems: { name: string; href: string; aliases: string[]; icon: React.ElementType; badge?: string }[] = user?.allowedNavItems
    ? user.allowedNavItems.map((item) => ({
        name: item.name,
        href: item.href,
        aliases: item.aliases,
        icon: iconMap[item.iconName] || LayoutGrid,
        badge: item.badge
      }))
    : [
        { name: "Overview", href: "/", aliases: ["/", "/overview"], icon: LayoutGrid },
        { name: "Outage Queue", href: "/queue", aliases: ["/queue", "/outage-queue"], icon: Zap },
        { name: "Region View", href: "/regions", aliases: ["/regions", "/region-view"], icon: Globe },
        { name: "Analytics", href: "/analytics", aliases: ["/analytics"], icon: TrendingUp },
        { name: "Exportable Data", href: "/export", aliases: ["/export", "/exportable-data"], icon: Download },
      ];

  const visibleFilters = user?.visibleFilters || {
    showPriority: true,
    showStatus: true,
    showRegionSelect: true,
    showNodeSearch: true,
    showServiceFilter: true,
    showRevenueTier: true
  };

  const isNavActive = (item: typeof navItems[0]) => {
    if (pathname === item.href) return true;
    return item.aliases?.includes(pathname);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#130E26] text-gray-200 min-h-screen flex flex-col justify-between border-r border-[#241A48] select-none shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Top Branding & Nav */}
      <div className="p-5 space-y-5">
        {/* Brand Logo */}
        <Link href={user ? user.primaryRoute : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform">
            OQ
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight leading-none group-hover:text-purple-300 transition-colors block">
              OutageIQ
            </span>
            <p className="text-[11px] text-gray-400 font-medium mt-1">
              Telecom Operations Suite
            </p>
          </div>
        </Link>

        {/* Logged-In User Role Card in Sidebar */}
        {user && (
          <div className="bg-[#1C143B] border border-[#2F235A] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                Active Session
              </span>
              <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${user.roleBadgeColor}`}>
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center ${
                user.roleType === "noc_engineer" ? "bg-purple-600" :
                user.roleType === "regional_ops" ? "bg-blue-600" :
                user.roleType === "cx_lead" ? "bg-emerald-600" :
                "bg-amber-600"
              }`}>
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] font-mono text-purple-300 truncate">ID: {user.userId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Group: MAIN */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              {user ? `${user.role.toUpperCase()} NAVIGATION` : "MAIN"}
            </span>
            <span className="text-[9px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-800/40">
              Role Scoped
            </span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !active && (
                    <span className="text-[9px] font-mono bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Group: FILTERS */}
        <div className="pt-4 border-t border-[#231A45] space-y-4">
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              ROLE FILTERS
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-mono font-semibold transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Region Dropdown Filter */}
          {visibleFilters.showRegionSelect && (
            <div className="space-y-1.5 px-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-gray-400">Telecom Region</div>
                {selectedRegion !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => onRegionChange && onRegionChange("ALL")}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-mono transition-colors cursor-pointer underline"
                  >
                    All
                  </button>
                )}
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => onRegionChange && onRegionChange(e.target.value)}
                className="w-full bg-[#1C143B] border border-[#2F235A] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-sans cursor-pointer"
              >
                <option value="ALL">All 9 Circles</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Jaipur">Jaipur</option>
              </select>
            </div>
          )}

          {/* Priority Tier Filters */}
          {visibleFilters.showPriority && (
            <div className="space-y-2 px-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-gray-400">Severity Tier</div>
                {selectedPriority !== "ALL" && (
                  <button
                    type="button"
                    onClick={() => onPriorityChange && onPriorityChange("ALL")}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-mono transition-colors cursor-pointer underline"
                  >
                    All
                  </button>
                )}
              </div>
              <div className="space-y-1 text-xs">
                {/* P1 Filter */}
                <button
                  type="button"
                  onClick={() => onPriorityChange && onPriorityChange(selectedPriority === "P1" ? "ALL" : "P1")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-left border ${
                    selectedPriority === "P1" || selectedPriority === "CRITICAL"
                      ? "bg-rose-500/25 text-white border-rose-500/60 shadow-xs ring-1 ring-rose-500/40"
                      : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    <span className={selectedPriority === "P1" || selectedPriority === "CRITICAL" ? "font-bold text-rose-200" : ""}>
                      P1 — Critical
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono font-semibold ${
                    selectedPriority === "P1" || selectedPriority === "CRITICAL" ? "text-rose-300 font-bold" : "text-purple-300"
                  }`}>
                    {priorityCounts.p1}
                  </span>
                </button>

                {/* P2 Filter */}
                <button
                  type="button"
                  onClick={() => onPriorityChange && onPriorityChange(selectedPriority === "P2" ? "ALL" : "P2")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-left border ${
                    selectedPriority === "P2" || selectedPriority === "HIGH"
                      ? "bg-amber-500/25 text-white border-amber-500/60 shadow-xs ring-1 ring-amber-500/40"
                      : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span className={selectedPriority === "P2" || selectedPriority === "HIGH" ? "font-bold text-amber-200" : ""}>
                      P2 — High
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono font-semibold ${
                    selectedPriority === "P2" || selectedPriority === "HIGH" ? "text-amber-300 font-bold" : "text-purple-300"
                  }`}>
                    {priorityCounts.p2}
                  </span>
                </button>

                {/* P3 Filter */}
                <button
                  type="button"
                  onClick={() => onPriorityChange && onPriorityChange(selectedPriority === "P3" ? "ALL" : "P3")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-left border ${
                    selectedPriority === "P3" || selectedPriority === "MEDIUM" || selectedPriority === "LOW"
                      ? "bg-yellow-500/25 text-white border-yellow-500/60 shadow-xs ring-1 ring-yellow-500/40"
                      : "text-gray-300 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0"></span>
                    <span className={selectedPriority === "P3" || selectedPriority === "MEDIUM" || selectedPriority === "LOW" ? "font-bold text-yellow-200" : ""}>
                      P3 — Medium
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono font-semibold ${
                    selectedPriority === "P3" || selectedPriority === "MEDIUM" || selectedPriority === "LOW" ? "text-yellow-300 font-bold" : "text-purple-300"
                  }`}>
                    {priorityCounts.p3}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Status Checkbox Filters */}
          {visibleFilters.showStatus && (
            <div className="space-y-2 px-3 pt-1">
              <div className="text-[11px] font-medium text-gray-400">Incident Lifecycle</div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={statusFilter.open}
                    onChange={(e) =>
                      onStatusChange &&
                      onStatusChange({ ...statusFilter, open: e.target.checked })
                    }
                    className="rounded bg-[#1E173D] border-[#2F2458] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 accent-purple-600 cursor-pointer"
                  />
                  <span>Open Active</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={statusFilter.inProgress}
                    onChange={(e) =>
                      onStatusChange &&
                      onStatusChange({ ...statusFilter, inProgress: e.target.checked })
                    }
                    className="rounded bg-[#1E173D] border-[#2F2458] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 accent-purple-600 cursor-pointer"
                  />
                  <span>In Progress / Triage</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={statusFilter.resolved}
                    onChange={(e) =>
                      onStatusChange &&
                      onStatusChange({ ...statusFilter, resolved: e.target.checked })
                    }
                    className="rounded bg-[#1E173D] border-[#2F2458] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 accent-purple-600 cursor-pointer"
                  />
                  <span>Resolved</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer & Sign Out */}
      <div className="p-4 border-t border-[#231A45] bg-[#0E0A1D] space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-purple-400" />
            <span>Telemetry: Live</span>
          </div>
          <div className="font-mono text-[10px] text-purple-400">v1.0 RBAC</div>
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-[#1A133A] hover:bg-rose-500/20 text-gray-300 hover:text-rose-200 border border-[#2E225A] hover:border-rose-500/40 text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out ({user.initials})</span>
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-xl transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}
