"use client";

import React from "react";

export default function MethodologySection() {
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
      badge: "PRD SECTION 6",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      desc: "Joins datasets on region_id. Complaints lacking explicit outage tags are dynamically matched to active region outages within a sliding time window.",
      detail: "region_id key • Time-window matching • Partial data confidence flagging"
    },
    {
      num: "03",
      title: "Min-Max Relative Normalization",
      badge: "PRD SECTION 7",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      desc: "Normalizes each sub-score to a 0–1 scale relative to active network conditions. Prevents static skew and guarantees dynamic adaptation.",
      detail: "0–1 Scaling • Active outage baseline • Config-driven weights"
    },
    {
      num: "04",
      title: "Weighted Composite Calculation",
      badge: "FR5 - FR7",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      desc: "Computes final Impact Score = 0.35·Reach + 0.30·Complaints + 0.20·Revenue + 0.15·Duration. Assigns Priority Tier (Critical, High, Med, Low).",
      detail: "35% Reach • 30% Complaints • 20% Revenue • 15% Duration"
    },
    {
      num: "05",
      title: "Real-time Queue & Reporting",
      badge: "FR8 - FR16",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      desc: "Instantly surfaces prioritized queue for NOC engineers, threshold alert banners, regional heatmaps, and executive summary reports.",
      detail: "<5s recompute speed • PDF/CSV export • In-app alert banners"
    }
  ];

  return (
    <section id="methodology" className="py-20 bg-gray-950/80 border-t border-gray-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold">
            PRD ARCHITECTURE & METHODOLOGY
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

        {/* Formula Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-purple-950/60 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
              PRD Formula (Section 7)
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
