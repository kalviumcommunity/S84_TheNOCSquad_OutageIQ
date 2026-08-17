"use client";

import React, { useState } from "react";

export default function PrdRequirementsExplorer() {
  const [activeTab, setActiveTab] = useState<"fr" | "schemas" | "nfr">("fr");

  const functionalRequirements = [
    { id: "FR1", name: "Data Source Upload", category: "Ingestion", desc: "Upload or point to CSV/JSON files for outage alerts, complaint logs, and usage metrics." },
    { id: "FR2", name: "Schema Validation", category: "Ingestion", desc: "Validate schema format, flag missing/malformed fields, show data quality summary." },
    { id: "FR3", name: "Data Cleaning", category: "Ingestion", desc: "Standardize timestamps, IDs, categorical severity/status, deduplicate records." },
    { id: "FR4", name: "Multi-Source Merge", category: "Ingestion", desc: "Merge datasets on region_id / outage_id with spatio-temporal matching fallback." },
    { id: "FR5", name: "Composite Scoring Engine", category: "Scoring Engine", desc: "Compute 4 normalized sub-scores and composite Impact Score per active outage." },
    { id: "FR6", name: "Real-time Recompute", category: "Scoring Engine", desc: "Recompute scores on data refresh as new complaints or usage data arrive." },
    { id: "FR7", name: "Priority Tier Assignment", category: "Scoring Engine", desc: "Assign Critical, High, Medium, Low tier & track score history." },
    { id: "FR8", name: "KPI Summary Bar", category: "Visualization", desc: "Surface active outages count, critical count, customers impacted, avg resolution time." },
    { id: "FR9", name: "Prioritized Outage Queue", category: "Visualization", desc: "Sortable, filterable table ranked by composite Impact Score." },
    { id: "FR10", name: "Explainable Outage Detail", category: "Visualization", desc: "Sub-score breakdown, region map/stats, linked complaints, timeline." },
    { id: "FR11", name: "Region View Heatmap", category: "Visualization", desc: "Impact heatmap and ranking by geographic region." },
    { id: "FR12", name: "Rolling Trend Analytics", category: "Visualization", desc: "Charts showing outage volume & impact score over rolling time window." },
    { id: "FR13", name: "Multi-Filter Controls", category: "Visualization", desc: "Filter by region, severity, status (open/resolved), date range, priority tier." },
    { id: "FR14", name: "Exportable Reports", category: "Reporting", desc: "Export prioritized list to CSV and summary report to PDF." },
    { id: "FR15", name: "Executive View Toggle", category: "Reporting", desc: "Presentation-ready condensed view featuring top 5 outages." },
    { id: "FR16", name: "Critical Threshold Alerts", category: "Alerts", desc: "In-app threshold banner when an outage crosses into Critical tier." }
  ];

  const dataSchemas = [
    {
      source: "Network Outage Alerts",
      grain: "1 row per outage event",
      fields: ["outage_id", "region_id", "tower/node_id", "start_time", "end_time", "severity", "status", "affected_services", "root_cause_code"]
    },
    {
      source: "Customer Complaint Logs",
      grain: "1 row per complaint",
      fields: ["complaint_id", "customer_id", "region_id", "timestamp", "channel", "category", "linked_outage_id", "sentiment/priority"]
    },
    {
      source: "Region Usage Metrics",
      grain: "1 row per region (snapshot)",
      fields: ["region_id", "region_name", "subscriber_count", "avg_daily_traffic", "revenue_tier", "plan_mix", "prior_month_ARPU"]
    }
  ];

  const nfrs = [
    { cat: "Performance", spec: "Dashboard refresh / score recompute in under ~5 seconds for datasets up to ~100k rows." },
    { cat: "Usability", spec: "No SQL or coding knowledge required to operate triage queue or export executive reports." },
    { cat: "Transparency", spec: "Every single score must be explainable via visible 4 sub-score breakdown (Zero black box)." },
    { cat: "Data Quality", spec: "Ingestion pipeline must surface (not silently drop) invalid or missing records with diagnostic logs." },
    { cat: "Reliability", spec: "Gracefully handles missing complaint/usage data with partial score & confidence flag." },
    { cat: "Extensibility", spec: "Scoring weights (35/30/20/15) are config-driven, allowing easy tuning without code changes." }
  ];

  return (
    <section id="prd-spec" className="py-20 bg-gray-950 border-t border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
            PRD SECTIONS 6, 8, 9 EXPLORER
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Complete PRD Technical Requirements
          </h2>
          <p className="text-gray-400 text-base">
            Explore the exact specifications, schemas, functional requirements, and non-functional guarantees established by The NOC Squad.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center border-b border-gray-800 mb-8 gap-4">
          <button
            onClick={() => setActiveTab("fr")}
            className={`pb-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all ${
              activeTab === "fr"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Functional Requirements (FR1–FR16)
          </button>
          <button
            onClick={() => setActiveTab("schemas")}
            className={`pb-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all ${
              activeTab === "schemas"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Data Sources & Schemas
          </button>
          <button
            onClick={() => setActiveTab("nfr")}
            className={`pb-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all ${
              activeTab === "nfr"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Non-Functional Requirements (NFRs)
          </button>
        </div>

        {/* Content Tab 1: FRs */}
        {activeTab === "fr" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {functionalRequirements.map((fr) => (
              <div
                key={fr.id}
                className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {fr.id}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{fr.category}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{fr.name}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{fr.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content Tab 2: Schemas */}
        {activeTab === "schemas" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {dataSchemas.map((ds, idx) => (
              <div key={idx} className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
                <div className="border-b border-gray-800 pb-3">
                  <h4 className="text-base font-bold text-white">{ds.source}</h4>
                  <div className="text-xs font-mono text-purple-400 mt-1">Grain: {ds.grain}</div>
                </div>

                <div>
                  <div className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Expected Key Fields</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ds.fields.map((field, fIdx) => (
                      <span key={fIdx} className="px-2 py-1 bg-gray-950 border border-gray-800 text-xs font-mono text-gray-300 rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Tab 3: NFRs */}
        {activeTab === "nfr" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfrs.map((nfr, idx) => (
              <div key={idx} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {nfr.cat}
                </span>
                <p className="text-xs text-gray-300 leading-relaxed mt-2">{nfr.spec}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
