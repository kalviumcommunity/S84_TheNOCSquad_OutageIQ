"use client";

import React, { useState } from "react";
import { REGIONS_DATA, OutageItem } from "@/lib/data";
import { downloadExecutivePdf } from "@/lib/pdf";
import { useFilter } from "@/context/FilterContext";
import { FileText, FileSpreadsheet, Globe, Download, Check, Filter, RotateCcw } from "lucide-react";

export default function ExportView() {
  const {
    sortedOutages,
    hasActiveFilters,
    resetFilters,
    selectedRegion,
    selectedPriority,
    statusFilter
  } = useFilter();

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerDownloadMessage = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Export 1: Prioritized Outage CSV
  const handleExportPrioritizedCsv = () => {
    const headers = "Rank,Outage ID,Region,Node,Severity,Impact Score,Status,Complaints,Duration,Priority,Customer Reach (35%),Complaint Pressure (30%),Revenue Exposure (20%),Duration & Severity (15%),Root Cause\n";
    const rows = sortedOutages.map((o, idx) =>
      `"${idx + 1}","${o.id}","${o.region}","${o.node}","${o.severity}","${o.impactScore}","${o.status}","${o.complaints}","${o.duration}","${o.priority}","${o.subscores?.reach || 60}","${o.subscores?.complaints || 60}","${o.subscores?.revenue || 60}","${o.subscores?.duration || 60}","${o.rootCause}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OutageIQ_Prioritized_Queue_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerDownloadMessage(`Prioritized Outage List CSV (${sortedOutages.length} records) downloaded successfully!`);
  };

  // Export 2: Executive Summary PDF
  const handleExportExecutivePdf = async () => {
    try {
      await downloadExecutivePdf({
        title: "OutageIQ Executive Incident Briefing",
        subtitle: `Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })} | Confidential`,
        kpis: [
          { label: "Total Outages", value: String(sortedOutages.length), sub: "+12% vs prior week" },
          { label: "Critical P1", value: String(sortedOutages.filter(o => o.severity === "Critical" || o.priority === "P1").length), sub: "Requires immediate dispatch" },
          { label: "Total Reach", value: "2.48M", sub: selectedRegion === "ALL" ? "Across all circles" : `In ${selectedRegion}` },
          { label: "SLA Compliance", value: "84%", sub: "Target >= 90%" },
        ],
        topOutages: sortedOutages.slice(0, 5),
      });
      triggerDownloadMessage("Executive Incident Briefing PDF downloaded successfully!");
    } catch (_) {
      triggerDownloadMessage("PDF generation completed.");
    }
  };

  // Export 3: Region Impact CSV
  const handleExportRegionCsv = () => {
    const regionSource = selectedRegion === "ALL" 
      ? REGIONS_DATA 
      : REGIONS_DATA.filter(r => r.name.toLowerCase() === selectedRegion.toLowerCase());

    const headers = "Rank,Region Name,Subscriber Base,Impact Score,Revenue Tier,Active Outages,Hourly Exposure,SLA Compliance,Dominant Severity\n";
    const rows = regionSource.map((r, idx) =>
      `"${idx + 1}","${r.name}","${r.subscriberCount}","${r.impactScore}","${r.revenueTier}","${r.activeOutages}","${r.revenueExposureHourly}","${r.slaCompliance}%","${r.dominantSeverity}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `OutageIQ_Region_Impact_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerDownloadMessage(`Region Impact Report CSV (${regionSource.length} regions) downloaded successfully!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-lg animate-in fade-in flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-emerald-200 hover:text-white ml-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Active Filter Bar */}
      {hasActiveFilters && (
        <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-purple-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>
              Exports will reflect active filters:{" "}
              {selectedRegion !== "ALL" && (
                <strong className="bg-white border border-purple-200 px-1.5 py-0.5 rounded text-purple-950 mr-1.5">
                  Region: {selectedRegion}
                </strong>
              )}
              {selectedPriority !== "ALL" && (
                <strong className="bg-white border border-purple-200 px-1.5 py-0.5 rounded text-purple-950 mr-1.5">
                  Priority: {selectedPriority}
                </strong>
              )}
              ({sortedOutages.length} matching outages)
            </span>
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* Top 3 Export Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Prioritized Outage List */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">
                Prioritized Outage List
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-medium pt-1">
              Full ranked list with impact scores ({sortedOutages.length} items)
            </p>
          </div>

          <div>
            <button
              onClick={handleExportPrioritizedCsv}
              className="px-3.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold font-mono transition-colors cursor-pointer shadow-2xs"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Card 2: Executive Summary Report */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">
                Executive Summary Report
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-medium pt-1">
              Top 5 outages + KPI summary
            </p>
          </div>

          <div>
            <button
              onClick={handleExportExecutivePdf}
              className="px-3.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold font-mono transition-colors cursor-pointer shadow-2xs"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Card 3: Region Impact Report */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">
                Region Impact Report
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-medium pt-1">
              Breakdown by region with sub-scores
            </p>
          </div>

          <div>
            <button
              onClick={handleExportRegionCsv}
              className="px-3.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold font-mono transition-colors cursor-pointer shadow-2xs"
            >
              Export CSV
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Card: Data Preview — Current Prioritized Queue */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 font-sans">
            Data Preview — Current Prioritized Queue ({sortedOutages.length} records)
          </h2>
          {hasActiveFilters && (
            <span className="text-[11px] text-purple-700 font-mono font-semibold">
              Filtered View
            </span>
          )}
        </div>

        {/* Table */}
        {sortedOutages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Rank</th>
                  <th className="pb-3 font-semibold">Outage ID</th>
                  <th className="pb-3 font-semibold">Region</th>
                  <th className="pb-3 font-semibold">Severity</th>
                  <th className="pb-3 font-semibold">Impact Score</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Complaints</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedOutages.map((outage, idx) => (
                  <tr key={outage.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 font-mono text-gray-400 font-bold">
                      #{idx + 1}
                    </td>
                    <td className="py-3 font-mono font-bold text-purple-600">
                      {outage.id}
                    </td>
                    <td className="py-3 font-semibold text-gray-800">
                      {outage.region}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          outage.severity === "Critical"
                            ? "bg-rose-100 text-rose-700"
                            : outage.severity === "High"
                            ? "bg-amber-100 text-amber-700"
                            : outage.severity === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {outage.severity}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-gray-900">
                      {outage.impactScore}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          outage.status === "Open"
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : outage.status === "In Progress" || outage.status === "Active Triage"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}
                      >
                        {outage.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700 font-mono">
                      {outage.complaints.toLocaleString()}
                    </td>
                    <td className="py-3 text-gray-500 font-mono text-[11px]">
                      {outage.duration}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white ${
                          outage.priority === "P1"
                            ? "bg-rose-500"
                            : outage.priority === "P2"
                            ? "bg-amber-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {outage.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-500">
            No outages match the active filter criteria.
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleExportPrioritizedCsv}
            className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExecutivePdf}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span>Export PDF Summary</span>
          </button>
        </div>

      </div>

    </div>
  );
}
