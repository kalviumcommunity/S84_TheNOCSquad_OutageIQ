"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Zap,
  Globe,
  TrendingUp,
  Download,
  AlertCircle,
  Clock
} from "lucide-react";

interface SidebarProps {
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  statusFilter?: { open: boolean; inProgress: boolean; resolved: boolean };
  onStatusChange?: (status: { open: boolean; inProgress: boolean; resolved: boolean }) => void;
  priorityCounts?: { p1: number; p2: number; p3: number };
}

export default function Sidebar({
  selectedRegion = "ALL",
  onRegionChange,
  statusFilter = { open: true, inProgress: true, resolved: false },
  onStatusChange,
  priorityCounts = { p1: 2, p2: 4, p3: 3 }
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: "/",
      aliases: ["/", "/overview"],
      icon: LayoutGrid
    },
    {
      name: "Outage Queue",
      href: "/queue",
      aliases: ["/queue", "/outage-queue"],
      icon: Zap
    },
    {
      name: "Region View",
      href: "/regions",
      aliases: ["/regions", "/region-view"],
      icon: Globe
    },
    {
      name: "Analytics",
      href: "/analytics",
      aliases: ["/analytics"],
      icon: TrendingUp
    },
    {
      name: "Exportable Data",
      href: "/export",
      aliases: ["/export", "/exportable-data"],
      icon: Download
    }
  ];

  const isNavActive = (item: typeof navItems[0]) => {
    if (pathname === item.href) return true;
    return item.aliases.includes(pathname);
  };

  return (
    <aside className="w-64 bg-[#130E26] text-gray-200 min-h-screen flex flex-col justify-between border-r border-[#241A48] select-none shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Top Branding & Nav */}
      <div className="p-5 space-y-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform">
            OQ
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight leading-none group-hover:text-purple-300 transition-colors block">
              OutageIQ
            </span>
            <p className="text-[11px] text-gray-400 font-medium mt-1">
              NOC Dashboard
            </p>
          </div>
        </Link>

        {/* Navigation Group: MAIN */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 font-mono">
            MAIN
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Group: FILTERS */}
        <div className="pt-4 border-t border-[#231A45] space-y-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 font-mono">
            FILTERS
          </div>

          {/* Priority Tier Filters */}
          <div className="space-y-2 px-3">
            <div className="text-[11px] font-medium text-gray-400">Priority</div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-300 hover:text-white transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>P1 — Critical</span>
                </div>
                <span className="text-[11px] font-mono text-purple-300 font-semibold">{priorityCounts.p1}</span>
              </div>
              <div className="flex items-center justify-between text-gray-300 hover:text-white transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>P2 — High</span>
                </div>
                <span className="text-[11px] font-mono text-purple-300 font-semibold">{priorityCounts.p2}</span>
              </div>
              <div className="flex items-center justify-between text-gray-300 hover:text-white transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span>P3 — Medium</span>
                </div>
                <span className="text-[11px] font-mono text-purple-300 font-semibold">{priorityCounts.p3}</span>
              </div>
            </div>
          </div>

          {/* Status Checkbox Filters */}
          <div className="space-y-2 px-3 pt-2">
            <div className="text-[11px] font-medium text-gray-400">Status</div>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={statusFilter.open}
                  onChange={(e) =>
                    onStatusChange &&
                    onStatusChange({ ...statusFilter, open: e.target.checked })
                  }
                  className="rounded bg-[#1E173D] border-[#2F2458] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 accent-purple-600"
                />
                <span>Open</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={statusFilter.inProgress}
                  onChange={(e) =>
                    onStatusChange &&
                    onStatusChange({ ...statusFilter, inProgress: e.target.checked })
                  }
                  className="rounded bg-[#1E173D] border-[#2F2458] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 accent-purple-600"
                />
                <span>In Progress</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={statusFilter.resolved}
                  onChange={(e) =>
                    onStatusChange &&
                    onStatusChange({ ...statusFilter, resolved: e.target.checked })
                  }
                  className="rounded bg-[#1E173D] border-[#2F2458] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 accent-purple-600"
                />
                <span>Resolved</span>
              </label>
            </div>
          </div>

          {/* Region Dropdown Filter */}
          <div className="space-y-1.5 px-3 pt-2">
            <div className="text-[11px] font-medium text-gray-400">Region</div>
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange && onRegionChange(e.target.value)}
              className="w-full bg-[#1C143B] border border-[#2F235A] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-sans"
            >
              <option value="ALL">All Regions</option>
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
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#231A45] bg-[#0E0A1D] text-[11px] text-gray-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-purple-400" />
          <span>Last refresh: 2 min ago</span>
        </div>
        <div className="font-mono text-purple-400 font-semibold">
          v1.0 - NOC Squad
        </div>
      </div>
    </aside>
  );
}
