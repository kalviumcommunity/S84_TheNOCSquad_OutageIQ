"use client";

import React, { useState } from "react";

export default function PrdRequirementsExplorer() {
  const [activeTab, setActiveTab] = useState<"fr" | "schemas" | "nfr">("fr");
  const [selectedSchema, setSelectedSchema] = useState<string>("outages");

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
      id: "outages",
      source: "Network Outage Alerts",
      grain: "1 row per outage event",
      pk: "outage_id",
      joinKey: "region_id (to usage/complaints)",
      format: "CSV / JSON",
      completeness: "100%",
      healthStatus: "HEALTHY",
      requiredFields: ["outage_id", "region_id", "start_time", "severity", "status"],
      fields: ["outage_id", "region_id", "tower/node_id", "start_time", "end_time", "severity", "status", "affected_services", "root_cause_code"],
      sampleRecord: {
        outage_id: "OUT-101",
        region_id: "REG-METRO",
        tower_id: "TWR-M-01",
        start_time: "2026-07-29 08:30:00",
        severity: "CRITICAL",
        status: "open",
        affected_services: "5G/Fiber/VoLTE",
        root_cause_code: "FIBER_CUT_CORE"
      }
    },
    {
      id: "complaints",
      source: "Customer Complaint Logs",
      grain: "1 row per complaint",
      pk: "complaint_id",
      joinKey: "linked_outage_id / (region_id + ±2h temporal window)",
      format: "CSV / JSON",
      completeness: "100%",
      healthStatus: "HEALTHY",
      requiredFields: ["complaint_id", "region_id", "timestamp"],
      fields: ["complaint_id", "customer_id", "region_id", "timestamp", "channel", "category", "linked_outage_id", "sentiment/priority"],
      sampleRecord: {
        complaint_id: "CMP-1001",
        customer_id: "CUST-9012",
        region_id: "REG-METRO",
        timestamp: "2026-07-29 08:35:00",
        channel: "Call Center",
        category: "Total Blackout",
        linked_outage_id: "OUT-101",
        sentiment: "Negative"
      }
    },
    {
      id: "usage",
      source: "Region Usage Metrics",
      grain: "1 row per region (snapshot)",
      pk: "region_id",
      joinKey: "region_id (Primary Dimension)",
      format: "CSV / JSON",
      completeness: "100%",
      healthStatus: "HEALTHY",
      requiredFields: ["region_id", "region_name", "subscriber_count", "revenue_tier"],
      fields: ["region_id", "region_name", "subscriber_count", "avg_daily_traffic", "revenue_tier", "plan_mix", "prior_month_ARPU"],
      sampleRecord: {
        region_id: "REG-METRO",
        region_name: "National Metro Core",
        subscriber_count: 2500000,
        avg_daily_traffic: 185000.5,
        revenue_tier: "Tier 1",
        plan_mix: "Enterprise/5G Premium",
        prior_month_ARPU: 48.50
      }
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

  const currentSchemaObj = dataSchemas.find((s) => s.id === selectedSchema) || dataSchemas[0];

  return (
    <section id="system-spec" className="py-20 bg-gray-950 border-t border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
            SYSTEM ARCHITECTURE & SPECIFICATIONS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            System Technical Specifications & Schemas
          </h2>
          <p className="text-gray-400 text-base">
            Explore the exact architecture, data schemas, functional capabilities, and non-functional guarantees governing the OutageIQ platform.
          </p>
        </div>

        {/* Live Schema Health Banner */}
        <div className="mb-10 bg-gradient-to-r from-gray-900/90 via-indigo-950/40 to-gray-900/90 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm font-bold text-white font-mono">Phase 1: Ingestion & Schema Engine</span>
                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono rounded border border-emerald-500/30 font-semibold">
                  Active & Operational
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Multi-source ingestion pipeline running strict schema validation, malformed record diagnostics, and automated intake reporting.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="bg-gray-950/80 px-3 py-1.5 rounded-lg border border-gray-800 text-gray-300">
                <span className="text-gray-500">Formats:</span> <span className="text-blue-400 font-bold">CSV / JSON</span>
              </div>
              <div className="bg-gray-950/80 px-3 py-1.5 rounded-lg border border-gray-800 text-gray-300">
                <span className="text-gray-500">Schema Health:</span> <span className="text-emerald-400 font-bold">100% Validated</span>
              </div>
              <div className="bg-gray-950/80 px-3 py-1.5 rounded-lg border border-gray-800 text-gray-300">
                <span className="text-gray-500">Data Loss:</span> <span className="text-purple-400 font-bold">0 Records Dropped</span>
              </div>
            </div>
          </div>
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
          <div className="space-y-8">
            {/* Top Schema Cards */}
            <div className="grid lg:grid-cols-3 gap-6">
              {dataSchemas.map((ds) => (
                <div
                  key={ds.id}
                  onClick={() => setSelectedSchema(ds.id)}
                  className={`bg-gray-900/80 border rounded-2xl p-6 space-y-4 cursor-pointer transition-all ${
                    selectedSchema === ds.id
                      ? "border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/50 bg-gray-900/95"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="border-b border-gray-800 pb-3 flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{ds.source}</h4>
                      <div className="text-xs font-mono text-purple-400 mt-1">Grain: {ds.grain}</div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                      {ds.healthStatus}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Expected Key Fields</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ds.fields.map((field, fIdx) => (
                        <span
                          key={fIdx}
                          className={`px-2 py-1 text-xs font-mono rounded border ${
                            ds.requiredFields.includes(field.replace("tower/node_id", "tower_id"))
                              ? "bg-purple-950/40 border-purple-500/30 text-purple-300 font-semibold"
                              : "bg-gray-950 border-gray-800 text-gray-300"
                          }`}
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span>PK: <strong className="text-gray-200">{ds.pk}</strong></span>
                    <span>Format: <strong className="text-blue-400">{ds.format}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Data Quality & Sample Inspector */}
            <div className="bg-gray-900/90 border border-purple-500/30 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
                <div>
                  <div className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
                    Data Quality & Intake Diagnostics Inspector
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Dataset Schema Health & Intake Diagnostics Profile
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">Selected Dataset:</span>
                  <span className="text-xs font-mono font-bold text-white bg-purple-500/20 px-2.5 py-1 rounded border border-purple-500/30">
                    {currentSchemaObj.id}.csv / .json
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-1">
                  <div className="text-xs text-gray-400 font-mono">Primary Key & Join Key</div>
                  <div className="text-sm font-bold text-white font-mono">{currentSchemaObj.pk}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{currentSchemaObj.joinKey}</div>
                </div>

                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-1">
                  <div className="text-xs text-gray-400 font-mono">Data Completeness Guarantee</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">100.0% Complete</div>
                  <div className="text-[11px] text-gray-500 font-mono">Zero Silent Record Drops (FR2 / NFR)</div>
                </div>

                <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 space-y-1">
                  <div className="text-xs text-gray-400 font-mono">Ingestion Validation Status</div>
                  <div className="text-sm font-bold text-blue-400 font-mono">Schema Validated</div>
                  <div className="text-[11px] text-gray-500 font-mono">Strict Null PK Check: Passed</div>
                </div>
              </div>

              {/* Sample Record JSON Viewer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Standardized Canonical Record Payload
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    ✓ Validated against REQUIRED_SCHEMAS
                  </span>
                </div>
                <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(currentSchemaObj.sampleRecord, null, 2)}
                </pre>
              </div>
            </div>
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
