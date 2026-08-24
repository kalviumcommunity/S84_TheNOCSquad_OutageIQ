"use client";

import React, { useState } from "react";

interface RegionalMetric {
  regionId: string;
  rank: number;
  outageCount: number;
  subscribers: number;
  revenueExposure: string;
  dominantSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  avgImpactScore: number;
  slaCompliancePct: number;
  densityRating: "CRITICAL_IMPACT" | "HIGH_IMPACT" | "MODERATE_IMPACT" | "HEALTHY";
  densityStatus: string;
  keyNodes: string[];
}

const mockRegionalMetrics: RegionalMetric[] = [
  {
    regionId: "North Region",
    rank: 1,
    outageCount: 2,
    subscribers: 46200,
    revenueExposure: "$45,950 / hr",
    dominantSeverity: "CRITICAL",
    avgImpactScore: 57.8,
    slaCompliancePct: 50.0,
    densityRating: "CRITICAL_IMPACT",
    densityStatus: "🔴 High Impact Concentration",
    keyNodes: ["Node-DEL-991", "Tower-GZB-012"]
  },
  {
    regionId: "West Region",
    rank: 2,
    outageCount: 1,
    subscribers: 32000,
    revenueExposure: "$38,500 / hr",
    dominantSeverity: "CRITICAL",
    avgImpactScore: 88.5,
    slaCompliancePct: 0.0,
    densityRating: "CRITICAL_IMPACT",
    densityStatus: "🔴 High Impact Concentration",
    keyNodes: ["Tower-BOM-402"]
  },
  {
    regionId: "South Region",
    rank: 3,
    outageCount: 1,
    subscribers: 28000,
    revenueExposure: "$28,000 / hr",
    dominantSeverity: "CRITICAL",
    avgImpactScore: 76.1,
    slaCompliancePct: 100.0,
    densityRating: "CRITICAL_IMPACT",
    densityStatus: "🔴 High Impact Concentration",
    keyNodes: ["Node-BLR-108"]
  },
  {
    regionId: "East Region",
    rank: 4,
    outageCount: 1,
    subscribers: 14000,
    revenueExposure: "$15,200 / hr",
    dominantSeverity: "HIGH",
    avgImpactScore: 64.3,
    slaCompliancePct: 100.0,
    densityRating: "HIGH_IMPACT",
    densityStatus: "🟠 Elevated Incident Load",
    keyNodes: ["Tower-CCU-055"]
  },
  {
    regionId: "Central Region",
    rank: 5,
    outageCount: 1,
    subscribers: 6500,
    revenueExposure: "$6,100 / hr",
    dominantSeverity: "MEDIUM",
    avgImpactScore: 42.8,
    slaCompliancePct: 100.0,
    densityRating: "MODERATE_IMPACT",
    densityStatus: "🔵 Moderate Activity",
    keyNodes: ["Node-BHO-220"]
  }
];

export default function RegionalImpactOverview() {
  const [sortBy, setSortBy] = useState<"subscribers" | "revenue" | "score">("subscribers");
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<string | null>(null);

  const handleFilterQueueByRegion = (regionName: string) => {
    // Dispatch custom event to LiveQueuePreview
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("filter-region", { detail: regionName }));
      const queueElement = document.getElementById("queue-preview");
      if (queueElement) {
        queueElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const sortedRegions = [...mockRegionalMetrics].sort((a, b) => {
    if (sortBy === "revenue") {
      const getRev = (r: string) => parseFloat(r.replace(/[^0-9.]/g, "")) || 0;
      return getRev(b.revenueExposure) - getRev(a.revenueExposure);
    } else if (sortBy === "score") {
      return b.avgImpactScore - a.avgImpactScore;
    }
    return b.subscribers - a.subscribers;
  });

  const totalSubscribers = mockRegionalMetrics.reduce((acc, r) => acc + r.subscribers, 0);
  const totalOutages = mockRegionalMetrics.reduce((acc, r) => acc + r.outageCount, 0);

  return (
    <section id="regional-analytics" className="py-20 bg-gray-900/50 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
              GEO-OPERATIONAL REGIONAL HEATMAP
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Regional Impact & Density Analytics
            </h2>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Geographic distribution of outage incidents, subscriber reach exposure, and SLA compliance across operational sectors. Designed for Regional Ops Managers (Priya) and Executive Leadership.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs font-mono">
              <span className="text-gray-400">Total Exposed:</span>
              <div className="text-base font-bold text-white mt-0.5">{totalSubscribers.toLocaleString()} subs</div>
            </div>
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs font-mono">
              <span className="text-gray-400">Active Incidents:</span>
              <div className="text-base font-bold text-amber-400 mt-0.5">{totalOutages} in 5 Regions</div>
            </div>
          </div>
        </div>

        {/* 5 Regional Impact Grid Cards (FR11) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedRegions.map((region) => (
            <div
              key={region.regionId}
              className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-xl relative flex flex-col justify-between ${
                region.densityRating === "CRITICAL_IMPACT"
                  ? "bg-gray-950/80 border-rose-500/30 hover:border-rose-500/60"
                  : region.densityRating === "HIGH_IMPACT"
                  ? "bg-gray-950/80 border-amber-500/30 hover:border-amber-500/60"
                  : "bg-gray-950/80 border-blue-500/30 hover:border-blue-500/60"
              }`}
            >
              <div>
                {/* Card Top: Rank & Region Name */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                      Rank #{region.rank} Impact Exposure
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2 font-mono">{region.regionId}</h3>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    region.dominantSeverity === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : region.dominantSeverity === "HIGH"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }`}>
                    {region.dominantSeverity} SEV
                  </span>
                </div>

                {/* Density Status Badge */}
                <div className="mb-4">
                  <span className="text-xs font-mono font-medium text-gray-300">
                    {region.densityStatus}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-800/80 text-xs font-mono mb-4">
                  <div>
                    <span className="text-gray-500 text-[11px]">Affected Subscribers</span>
                    <div className="text-sm font-bold text-white mt-0.5">{region.subscribers.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px]">Revenue Exposure</span>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{region.revenueExposure}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px]">Active Outages</span>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{region.outageCount} incident(s)</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[11px]">SLA Compliance</span>
                    <div className={`text-sm font-bold mt-0.5 ${
                      region.slaCompliancePct < 60 ? "text-rose-400" : "text-blue-400"
                    }`}>
                      {region.slaCompliancePct}%
                    </div>
                  </div>
                </div>

                {/* Nodes affected */}
                <div className="text-[11px] font-mono text-gray-400 mb-6">
                  <span className="text-gray-500">Affected Infrastructure: </span>
                  {region.keyNodes.join(", ")}
                </div>
              </div>

              {/* Quick Filter CTA Button (FR11 Persona Action) */}
              <button
                onClick={() => handleFilterQueueByRegion(region.regionId)}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/60 font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2 group"
              >
                <span>Filter Queue by {region.regionId}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Comparative Regional Geo Heatmap Density Matrix (FR11) */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">
                Comparative Regional Heatmap Matrix
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cross-dimensional operational density heatmap comparing subscriber reach, revenue at risk, and SLA pressure.
              </p>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-900 border border-gray-800 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="subscribers">Affected Subscribers (High to Low)</option>
                <option value="revenue">Revenue Exposure ($/hr)</option>
                <option value="score">Average Impact Score</option>
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-900/90 text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Operational Region</th>
                  <th className="py-3 px-4">Severity Load</th>
                  <th className="py-3 px-4">Subscriber Reach (Heat)</th>
                  <th className="py-3 px-4">Revenue Exposure / Hr</th>
                  <th className="py-3 px-4">Avg Impact Score</th>
                  <th className="py-3 px-4">SLA Compliance Rate</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {sortedRegions.map((region) => (
                  <tr key={region.regionId} className="hover:bg-gray-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {region.regionId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        region.dominantSeverity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          : region.dominantSeverity === "HIGH"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }`}>
                        {region.dominantSeverity} ({region.outageCount})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-200">{region.subscribers.toLocaleString()}</span>
                        <div className="w-20 bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-full"
                            style={{ width: `${Math.min(100, (region.subscribers / 50000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      {region.revenueExposure}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-400">
                      {region.avgImpactScore} / 100
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        region.slaCompliancePct < 60
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {region.slaCompliancePct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleFilterQueueByRegion(region.regionId)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                      >
                        Filter Queue →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
