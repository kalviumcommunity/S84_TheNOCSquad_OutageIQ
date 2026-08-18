"use client";

import React, { useState } from "react";

interface Outage {
  id: string;
  region: string;
  node: string;
  score: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  subscribers: number;
  complaintVelocity: number;
  revenueExposure: string;
  openDuration: string;
  severityCode: "P1" | "P2" | "P3";
  status: "Active Triage" | "Resolving" | "Investigating";
  confidenceFlag: boolean;
  confidenceReason: string;
  subscores: {
    reach: number;
    complaints: number;
    revenue: number;
    duration: number;
  };
  rootCause: string;
}

const mockOutages: Outage[] = [
  {
    id: "OUT-8902",
    region: "North Region",
    node: "Node-DEL-991",
    score: 94.2,
    priority: "CRITICAL",
    subscribers: 45000,
    complaintVelocity: 480,
    revenueExposure: "$45,000 / hr",
    openDuration: "3h 45m",
    severityCode: "P1",
    status: "Active Triage",
    confidenceFlag: true,
    confidenceReason: "Complete Telemetry (100% Signal Integrity)",
    subscores: { reach: 95, complaints: 92, revenue: 98, duration: 88 },
    rootCause: "Major Backhaul Fiber Cut near Core Data Center"
  },
  {
    id: "OUT-8904",
    region: "West Region",
    node: "Tower-BOM-402",
    score: 88.5,
    priority: "CRITICAL",
    subscribers: 32000,
    complaintVelocity: 390,
    revenueExposure: "$38,500 / hr",
    openDuration: "2h 10m",
    severityCode: "P1",
    status: "Investigating",
    confidenceFlag: true,
    confidenceReason: "Complete Telemetry (100% Signal Integrity)",
    subscores: { reach: 88, complaints: 90, revenue: 92, duration: 75 },
    rootCause: "Power Grid Substation Surge & Battery Bank Fail"
  },
  {
    id: "OUT-8901",
    region: "South Region",
    node: "Node-BLR-108",
    score: 76.1,
    priority: "CRITICAL",
    subscribers: 28000,
    complaintVelocity: 210,
    revenueExposure: "$28,000 / hr",
    openDuration: "5h 15m",
    severityCode: "P2",
    status: "Active Triage",
    confidenceFlag: true,
    confidenceReason: "Complete Telemetry (100% Signal Integrity)",
    subscores: { reach: 72, complaints: 70, revenue: 80, duration: 92 },
    rootCause: "Radio Frequency Degradation & Microwave Link Alignment"
  },
  {
    id: "OUT-8898",
    region: "East Region",
    node: "Tower-CCU-055",
    score: 64.3,
    priority: "HIGH",
    subscribers: 14000,
    complaintVelocity: 120,
    revenueExposure: "$15,200 / hr",
    openDuration: "1h 30m",
    severityCode: "P2",
    status: "Resolving",
    confidenceFlag: true,
    confidenceReason: "Complete Telemetry (100% Signal Integrity)",
    subscores: { reach: 60, complaints: 65, revenue: 68, duration: 62 },
    rootCause: "Card Hardware Memory Leak on Edge Router"
  },
  {
    id: "OUT-8895",
    region: "Central Region",
    node: "Node-BHO-220",
    score: 42.8,
    priority: "MEDIUM",
    subscribers: 6500,
    complaintVelocity: 45,
    revenueExposure: "$6,100 / hr",
    openDuration: "4h 00m",
    severityCode: "P3",
    status: "Active Triage",
    confidenceFlag: false,
    confidenceReason: "Partial Data: Missing subscriber usage snapshot (NFR Reliability)",
    subscores: { reach: 40, complaints: 38, revenue: 45, duration: 52 },
    rootCause: "Scheduled Firmware Update Delay on Secondary Switch"
  },
  {
    id: "OUT-8890",
    region: "North Region",
    node: "Tower-GZB-012",
    score: 21.4,
    priority: "LOW",
    subscribers: 1200,
    complaintVelocity: 8,
    revenueExposure: "$950 / hr",
    openDuration: "0h 45m",
    severityCode: "P3",
    status: "Resolving",
    confidenceFlag: true,
    confidenceReason: "Complete Telemetry (100% Signal Integrity)",
    subscores: { reach: 18, complaints: 15, revenue: 22, duration: 32 },
    rootCause: "Minor Feeder Cable Weather Degradation"
  }
];

export default function LiveQueuePreview() {
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [weightPreset, setWeightPreset] = useState<string>("BALANCED");
  const [execView, setExecView] = useState<boolean>(false);
  const [activeModalOutage, setActiveModalOutage] = useState<Outage | null>(null);

  // Weight configuration multipliers
  const getPresetMultiplier = (preset: string) => {
    switch (preset) {
      case "CUSTOMER_CENTRIC":
        return { reach: 1.14, complaints: 1.33, revenue: 0.5, duration: 0.67 };
      case "REVENUE_FOCUSED":
        return { reach: 0.57, complaints: 0.5, revenue: 2.5, duration: 1.0 };
      case "SEVERITY_ESCALATED":
        return { reach: 0.71, complaints: 0.83, revenue: 0.75, duration: 2.33 };
      default:
        return { reach: 1.0, complaints: 1.0, revenue: 1.0, duration: 1.0 };
    }
  };

  const mult = getPresetMultiplier(weightPreset);

  // Filter outages
  const filteredOutages = mockOutages.filter((outage) => {
    const regionMatch = selectedRegion === "ALL" || outage.region === selectedRegion;
    const priorityMatch = selectedPriority === "ALL" || outage.priority === selectedPriority;
    return regionMatch && priorityMatch;
  });

  const displayOutages = execView ? filteredOutages.slice(0, 5) : filteredOutages;

  return (
    <section id="queue-preview" className="py-20 bg-gray-950 border-t border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold mb-3">
              PRD SECTION 8.3 DASHBOARD DEMO
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Prioritized Outage Triage Queue
            </h2>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Live preview of the NOC engineer & leadership interface. Click any row to inspect explainable sub-score breakdowns (FR10).
            </p>
          </div>

          {/* Executive View Toggle (FR15) */}
          <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-xl border border-gray-800 shrink-0">
            <span className="text-xs font-semibold text-gray-300">Executive View Toggle (FR15):</span>
            <button
              onClick={() => setExecView(!execView)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                execView ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  execView ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-xs font-mono font-bold ${execView ? "text-blue-400" : "text-gray-400"}`}>
              {execView ? "Top 5 Exec View ON" : "Standard View"}
            </span>
          </div>
        </div>

        {/* Executive Banner if active */}
        {execView && (
          <div className="mb-6 p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <span><strong>Executive View Active:</strong> Displaying Top 5 highest impact outages across all regions for weekly leadership reporting.</span>
            </div>
            <button
              onClick={() => alert("Simulating PDF Export generation... (FR14 Export complete)")}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              Export PDF Summary
            </button>
          </div>
        )}

        {/* Filters & Config Bar */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-t-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Region Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-gray-950 border border-gray-800 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Regions (5)</option>
                <option value="North Region">North Region</option>
                <option value="South Region">South Region</option>
                <option value="East Region">East Region</option>
                <option value="West Region">West Region</option>
                <option value="Central Region">Central Region</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-gray-950 border border-gray-800 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Tiers</option>
                <option value="CRITICAL">Critical Tier (≥75)</option>
                <option value="HIGH">High Tier (50–74)</option>
                <option value="MEDIUM">Medium Tier (25–49)</option>
                <option value="LOW">Low Tier (&lt;25)</option>
              </select>
            </div>

            {/* Scoring Weight Preset (FR7 / NFR Extensibility) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">Scoring Weights:</span>
              <select
                value={weightPreset}
                onChange={(e) => setWeightPreset(e.target.value)}
                className="bg-gray-950 border border-purple-500/30 text-xs text-purple-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 font-mono"
              >
                <option value="BALANCED">Balanced (35/30/20/15)</option>
                <option value="CUSTOMER_CENTRIC">Customer-Centric (40/40/10/10)</option>
                <option value="REVENUE_FOCUSED">Revenue-Focused (20/15/50/15)</option>
                <option value="SEVERITY_ESCALATED">Severity-Escalated (25/25/15/35)</option>
              </select>
            </div>

          </div>

          <div className="text-xs text-gray-400 font-mono">
            Showing <strong>{displayOutages.length}</strong> of {mockOutages.length} outages • Ranked by Impact Score
          </div>
        </div>

        {/* Outage Table */}
        <div className="bg-gray-900/60 border-x border-b border-gray-800 rounded-b-2xl overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Rank & Outage ID</th>
                <th className="py-3.5 px-4 font-semibold">Impact Score</th>
                <th className="py-3.5 px-4 font-semibold">Region & Tower</th>
                <th className="py-3.5 px-4 font-semibold">Reach / Complaints</th>
                <th className="py-3.5 px-4 font-semibold">Revenue Exposure</th>
                <th className="py-3.5 px-4 font-semibold">Telemetry Confidence</th>
                <th className="py-3.5 px-4 font-semibold">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {displayOutages.map((outage, idx) => (
                <tr
                  key={outage.id}
                  onClick={() => setActiveModalOutage(outage)}
                  className="hover:bg-gray-800/50 transition-colors cursor-pointer group"
                >
                  {/* Rank & ID */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-800 text-gray-300 font-mono text-xs flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                          {outage.id}
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">Sev Code: {outage.severityCode}</span>
                      </div>
                    </div>
                  </td>

                  {/* Impact Score */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-extrabold font-mono ${
                        outage.priority === "CRITICAL" ? "text-rose-400" :
                        outage.priority === "HIGH" ? "text-amber-400" :
                        outage.priority === "MEDIUM" ? "text-blue-400" : "text-gray-400"
                      }`}>
                        {outage.score}
                      </span>
                      <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded border ${
                        outage.priority === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
                        outage.priority === "HIGH" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                        outage.priority === "MEDIUM" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {outage.priority}
                      </span>
                    </div>
                  </td>

                  {/* Region & Node */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-white">{outage.region}</div>
                    <div className="text-[11px] font-mono text-gray-400">{outage.node}</div>
                  </td>

                  {/* Reach / Complaints */}
                  <td className="py-4 px-4">
                    <div className="text-gray-200">{outage.subscribers.toLocaleString()} subscribers</div>
                    <div className="text-[11px] text-amber-400 font-mono">
                      ⚡ {outage.complaintVelocity} complaints/hr
                    </div>
                  </td>

                  {/* Revenue Exposure */}
                  <td className="py-4 px-4">
                    <div className="font-mono text-emerald-400 font-semibold">{outage.revenueExposure}</div>
                    <div className="text-[11px] font-mono text-gray-400">Open {outage.openDuration}</div>
                  </td>

                  {/* Telemetry Confidence (Phase 4 / NFR Reliability) */}
                  <td className="py-4 px-4">
                    {outage.confidenceFlag ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span>✓</span> High Confidence
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span>⚠️</span> Low Confidence - Partial Data
                      </span>
                    )}
                  </td>

                  {/* Status / Action */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                        {outage.status}
                      </span>
                      <span className="text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                        Inspect Breakdown →
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explainability Detail Drawer Modal (FR10) */}
        {activeModalOutage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-800 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-extrabold text-white font-mono">{activeModalOutage.id}</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                      activeModalOutage.priority === "CRITICAL" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                      activeModalOutage.priority === "HIGH" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      activeModalOutage.priority === "MEDIUM" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    }`}>
                      {activeModalOutage.priority} TIER
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {activeModalOutage.region} • {activeModalOutage.node}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalOutage(null)}
                  className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Score Summary & Root Cause */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-mono">Composite Impact Score</div>
                  <div className="text-3xl font-extrabold font-mono text-rose-400 mt-1">
                    {activeModalOutage.score} <span className="text-xs text-gray-500 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="text-left sm:text-right space-y-1">
                  <div className="text-xs text-gray-400 font-mono">Root Cause Identified</div>
                  <div className="text-xs font-semibold text-gray-200">{activeModalOutage.rootCause}</div>
                </div>
              </div>

              {/* Data Completeness & Telemetry Reliability (Phase 4 / NFR Reliability) */}
              <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-semibold">Data Completeness Status:</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeModalOutage.confidenceFlag ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      ✓ High Confidence — Complete Telemetry
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                      ⚠️ Low Confidence — Partial Data
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">({activeModalOutage.confidenceReason})</span>
                </div>
              </div>

              {/* Subscore Breakdown Bars (FR10) */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Transparent Sub-Score Breakdown (FR10)
                </h4>

                {/* Subscore 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-300">Customer Reach (35% Wt):</span>
                    <span className="text-blue-400 font-bold">{activeModalOutage.subscores.reach} / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${activeModalOutage.subscores.reach}%` }} />
                  </div>
                </div>

                {/* Subscore 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-300">Complaint Pressure (30% Wt):</span>
                    <span className="text-amber-400 font-bold">{activeModalOutage.subscores.complaints} / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${activeModalOutage.subscores.complaints}%` }} />
                  </div>
                </div>

                {/* Subscore 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-300">Revenue Exposure (20% Wt):</span>
                    <span className="text-purple-400 font-bold">{activeModalOutage.subscores.revenue} / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${activeModalOutage.subscores.revenue}%` }} />
                  </div>
                </div>

                {/* Subscore 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-300">Duration & Severity (15% Wt):</span>
                    <span className="text-rose-400 font-bold">{activeModalOutage.subscores.duration} / 100</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${activeModalOutage.subscores.duration}%` }} />
                  </div>
                </div>

                {/* Phase 2 Complaint Linkage Correlation (FR4) */}
                <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">⚡</span>
                    <span className="text-gray-300">Complaint Fusion (FR4):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      78% Explicit Tags
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                      22% Temporal Matched (±2h)
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveModalOutage(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  Done Inspecting
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
