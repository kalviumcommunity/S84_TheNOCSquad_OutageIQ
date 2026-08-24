"use client";

import React, { useState } from "react";

export default function MethodologySection() {
  const [timeWindow, setTimeWindow] = useState<number>(2.0);

  const steps = [
    {
      num: "01",
      title: "Multi-Source Data Ingestion",
      badge: "FR1 - FR4",
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      desc: "Ingests three separate data streams: Network Outage Alerts, Call Center & App Complaint Logs, and Regional Subscriber & Revenue snapshots.",
      detail: "CSV / JSON input • Schema validation • Malformed record flagging"
    },
    {
      num: "02",
      title: "Spatio-Temporal Fusion & Join",
      badge: "FUSION ENGINE",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      desc: "Joins datasets on region_id. Complaints lacking explicit outage tags are dynamically matched to active region outages within a sliding time window.",
      detail: "region_id key • Time-window matching • Partial data confidence flagging"
    },
    {
      num: "03",
      title: "Min-Max Relative Normalization",
      badge: "SCORING MODEL",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      desc: "Normalizes each sub-score to a 0–1 scale relative to active network conditions. Prevents static skew and guarantees dynamic adaptation.",
      detail: "0–1 Scaling • Active outage baseline • Config-driven weights"
    },
    {
      num: "04",
      title: "Weighted Composite Calculation",
      badge: "PRIORITY TIERING",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      desc: "Computes final Impact Score = 0.35·Reach + 0.30·Complaints + 0.20·Revenue + 0.15·Duration. Assigns Priority Tier (Critical, High, Med, Low).",
      detail: "35% Reach • 30% Complaints • 20% Revenue • 15% Duration"
    },
    {
      num: "05",
      title: "Real-time Queue & Reporting",
      badge: "LIVE OPERATIONS",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      desc: "Instantly surfaces prioritized queue for NOC engineers, threshold alert banners, regional heatmaps, and executive summary reports.",
      detail: "<5s recompute speed • PDF/CSV export • In-app alert banners"
    }
  ];

  // Dynamic simulation for temporal window adjustments (FR4, Phase 2)
  const totalComplaints = 500;
  const explicitCount = 340; // 68%
  // Increasing window links more unlinked complaints
  const temporalMatchCount = Math.min(145, Math.round(75 + timeWindow * 25));
  const unlinkedCount = Math.max(0, totalComplaints - explicitCount - temporalMatchCount);

  const matchedTotal = explicitCount + temporalMatchCount;
  const matchRatioPct = ((matchedTotal / totalComplaints) * 100).toFixed(1);
  const unlinkedRatioPct = ((unlinkedCount / totalComplaints) * 100).toFixed(1);

  const sampleComplaintStream = [
    { id: "CMP-901", region: "REG-METRO", time: "08:35 AM", channel: "Call Center", matchType: "explicit", linkedOutage: "OUT-101" },
    { id: "CMP-902", region: "REG-METRO", time: "08:42 AM", channel: "Mobile App", matchType: "explicit", linkedOutage: "OUT-101" },
    { id: "CMP-903", region: "REG-METRO", time: "09:10 AM", channel: "Social Media", matchType: timeWindow >= 1.0 ? "temporal_match" : "unlinked", linkedOutage: timeWindow >= 1.0 ? "OUT-101" : "None" },
    { id: "CMP-904", region: "REG-NORTH", time: "09:20 AM", channel: "Web Portal", matchType: "explicit", linkedOutage: "OUT-102" },
    { id: "CMP-905", region: "REG-NORTH", time: "11:05 AM", channel: "Call Center", matchType: timeWindow >= 2.0 ? "temporal_match" : "unlinked", linkedOutage: timeWindow >= 2.0 ? "OUT-102" : "None" }
  ];

  return (
    <section id="methodology" className="py-20 bg-gray-950/80 border-t border-gray-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold">
            SYSTEM ARCHITECTURE & METHODOLOGY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How OutageIQ Computes Impact
          </h2>
          <p className="text-gray-400 text-base">
            A transparent, 5-step data engineering pipeline built to turn unorganized telecom signals into prioritized action.
          </p>
        </div>

        {/* 5-Step Process Timeline */}
        <div className="grid md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
                  <span className="text-2xl font-extrabold font-mono text-gray-500 group-hover:text-blue-400 transition-colors">
                    {step.num}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${step.color}`}>
                    {step.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-3 border-t border-gray-800 text-[10px] font-mono text-gray-400 font-medium">
                {step.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Phase 2: Interactive Pipeline & Temporal Complaint Associator Panel */}
        <div id="pipeline-stage-view" className="mt-16 bg-gray-900/90 border border-purple-500/30 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-semibold">
                PHASE 2 DATA ENGINEERING
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
                Pipeline Stages & Spatial-Temporal Complaint Associator
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Visualizing data flow from raw streams to deduplication, temporal record linkage, and unified multi-table merge.
              </p>
            </div>

            {/* Time Window Slider */}
            <div className="bg-gray-950/80 border border-gray-800 p-4 rounded-xl min-w-[260px] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">Sliding Matching Window:</span>
                <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  ±{timeWindow.toFixed(1)} Hours
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={timeWindow}
                onChange={(e) => setTimeWindow(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>±0.5h</span>
                <span>Default ±2.0h</span>
                <span>±6.0h</span>
              </div>
            </div>
          </div>

          {/* 4 Pipeline Stages Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  STAGE 1
                </span>
                <span className="text-[10px] font-mono text-gray-500">Raw Ingestion</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">520 Records</div>
              <p className="text-[11px] text-gray-400">Raw alert logs, customer complaint events, and regional usage snapshots.</p>
            </div>

            <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  STAGE 2
                </span>
                <span className="text-[10px] font-mono text-gray-500">Deduplication</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">500 Valid Records</div>
              <p className="text-[11px] text-gray-400">Whitespace stripped, ID standardized, and duplicate primary keys pruned.</p>
            </div>

            <div className="bg-gray-950/80 border border-purple-500/40 rounded-xl p-4 space-y-2 bg-purple-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                  STAGE 3
                </span>
                <span className="text-[10px] font-mono text-purple-300">Spatial-Temporal Link</span>
              </div>
              <div className="text-lg font-bold text-purple-300 font-mono">{matchedTotal} Linked ({matchRatioPct}%)</div>
              <p className="text-[11px] text-gray-400">Explicit tags combined with ±{timeWindow.toFixed(1)}h sliding window matches.</p>
            </div>

            <div className="bg-gray-950/80 border border-emerald-500/40 rounded-xl p-4 space-y-2 bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  STAGE 4
                </span>
                <span className="text-[10px] font-mono text-emerald-300">Unified Merged Model</span>
              </div>
              <div className="text-lg font-bold text-emerald-300 font-mono">100% Joined</div>
              <p className="text-[11px] text-gray-400">Zero Cartesian explosion; full subscriber counts & complaint volumes attached.</p>
            </div>
          </div>

          {/* Linkage Breakdown Metrics & Sample Stream */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Summary Metrics */}
            <div className="lg:col-span-5 bg-gray-950/90 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                Complaint Linkage Distribution
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-gray-300">Explicit Outage Tags:</span>
                    <span className="text-emerald-400 font-bold">{explicitCount} ({((explicitCount / totalComplaints) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(explicitCount / totalComplaints) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-gray-300">Temporally Correlated Matches (±{timeWindow}h):</span>
                    <span className="text-purple-400 font-bold">{temporalMatchCount} ({((temporalMatchCount / totalComplaints) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${(temporalMatchCount / totalComplaints) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-gray-300">Unlinked / Isolated Complaints:</span>
                    <span className="text-rose-400 font-bold">{unlinkedCount} ({unlinkedRatioPct}%)</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${(unlinkedCount / totalComplaints) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400 font-mono">
                * Ensures customer complaints are accurately attributed to open outages for impact calculation via spatio-temporal sliding window.
              </div>
            </div>

            {/* Right: Sample Stream Table */}
            <div className="lg:col-span-7 bg-gray-950/90 border border-gray-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                  Live Complaint Stream Linkage Tags
                </div>
                <span className="text-[10px] font-mono text-purple-400">Dynamic Matching Active</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-gray-800 text-gray-500 text-[10px] uppercase">
                    <tr>
                      <th className="pb-2">Complaint ID</th>
                      <th className="pb-2">Region</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Linkage Type</th>
                      <th className="pb-2">Assigned Outage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {sampleComplaintStream.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-900/50">
                        <td className="py-2.5 text-white font-bold">{item.id}</td>
                        <td className="py-2.5 text-gray-400">{item.region}</td>
                        <td className="py-2.5 text-gray-400">{item.time}</td>
                        <td className="py-2.5">
                          {item.matchType === "explicit" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              Explicit Tag
                            </span>
                          ) : item.matchType === "temporal_match" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                              Temporal Match
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                              Unlinked
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-blue-400 font-bold">{item.linkedOutage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* Formula Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-purple-950/60 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              Vectorized Composite Impact Formula
            </span>
            <div className="text-sm sm:text-base font-mono font-bold text-white">
              Impact Score = <span className="text-blue-400">0.35·Reach</span> + <span className="text-amber-400">0.30·Complaints</span> + <span className="text-purple-400">0.20·Revenue</span> + <span className="text-rose-400">0.15·Duration</span>
            </div>
          </div>
          <a
            href="#calculator"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors shrink-0"
          >
            Test Formula Live
          </a>
        </div>

      </div>
    </section>
  );
}
