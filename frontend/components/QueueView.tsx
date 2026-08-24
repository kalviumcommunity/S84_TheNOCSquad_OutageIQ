"use client";

import React, { useState } from "react";
import { INITIAL_OUTAGES, OutageItem } from "@/lib/data";
import { AlertTriangle, UserCheck, ShieldAlert, ArrowUpDown, CheckCircle, Search } from "lucide-react";

export default function QueueView() {
  const [outages, setOutages] = useState<OutageItem[]>(INITIAL_OUTAGES);
  const [selectedOutage, setSelectedOutage] = useState<OutageItem>(INITIAL_OUTAGES[0]);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"score" | "complaints" | "duration">("score");
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleEscalate = () => {
    setNotification(`⚡ Emergency Escalation Triggered for ${selectedOutage.id} (P1 Field Tech Dispatched)!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAssign = () => {
    setNotification(`✓ Outage ${selectedOutage.id} assigned to Tier 3 Optical Lead.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter & Sort
  const filtered = outages.filter((o) => {
    const matchSev = filterSeverity === "ALL" || o.severity.toUpperCase() === filterSeverity.toUpperCase();
    const query = searchQuery.toLowerCase().trim();
    const matchSearch = query === "" || o.id.toLowerCase().includes(query) || o.region.toLowerCase().includes(query) || o.node.toLowerCase().includes(query);
    return matchSev && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "score") return b.impactScore - a.impactScore;
    if (sortField === "complaints") return b.complaints - a.complaints;
    if (sortField === "duration") return b.durationHours - a.durationHours;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-purple-900 text-white rounded-xl text-xs font-semibold shadow-lg animate-in fade-in flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-purple-200 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Main Grid: Left List (8 cols) & Right Detail Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: All Active Outages Table */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                All Active Outages
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {sorted.length} outages matching filters
              </p>
            </div>

            {/* Filter and Sort Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search outages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-3 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
              >
                <option value="score">Sort: Impact Score</option>
                <option value="complaints">Sort: Complaints</option>
                <option value="duration">Sort: Duration</option>
              </select>
            </div>
          </div>

          {/* Table */}
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
                {sorted.map((outage, idx) => {
                  const isSelected = selectedOutage.id === outage.id;
                  return (
                    <tr
                      key={outage.id}
                      onClick={() => setSelectedOutage(outage)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-purple-50/80 font-medium" : "hover:bg-gray-50/80"
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 font-mono text-gray-400 font-bold">
                        #{idx + 1}
                      </td>

                      {/* Outage ID */}
                      <td className="py-3.5 font-mono font-bold text-purple-600">
                        {outage.id}
                      </td>

                      {/* Region */}
                      <td className="py-3.5 font-semibold text-gray-800">
                        {outage.region}
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3.5">
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

                      {/* Impact Score */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                outage.impactScore >= 75
                                  ? "bg-rose-500"
                                  : outage.impactScore >= 50
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${outage.impactScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-900 font-mono">
                            {outage.impactScore}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            outage.status === "Open"
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : outage.status === "In Progress"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}
                        >
                          {outage.status}
                        </span>
                      </td>

                      {/* Complaints */}
                      <td className="py-3.5 text-gray-700 font-mono">
                        {outage.complaints.toLocaleString()}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 text-gray-500 font-mono text-[11px]">
                        {outage.duration}
                      </td>

                      {/* Priority Pill */}
                      <td className="py-3.5">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Outage Detail Panel */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-5 sticky top-6">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                OUTAGE DETAIL
              </span>
              <h3 className="text-sm font-mono font-extrabold text-purple-600 mt-0.5">
                {selectedOutage.id}
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-white ${
              selectedOutage.priority === "P1" ? "bg-rose-500" : selectedOutage.priority === "P2" ? "bg-amber-500" : "bg-gray-400"
            }`}>
              {selectedOutage.priority}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Region</span>
              <span className="font-semibold text-gray-900">{selectedOutage.region}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Severity</span>
              <span className="font-semibold text-rose-600">{selectedOutage.severity}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-gray-900">{selectedOutage.status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Duration</span>
              <span className="font-mono text-gray-900">{selectedOutage.duration}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Complaints</span>
              <span className="font-mono font-bold text-gray-900">{selectedOutage.complaints.toLocaleString()}</span>
            </div>
          </div>

          {/* Sub-score Breakdown */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              Sub-score Breakdown
            </span>

            {/* Reach */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-gray-700">
                <span>Customer Reach (35%)</span>
                <span className="font-mono font-bold text-gray-900">{selectedOutage.subscores.reach}/100</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${selectedOutage.subscores.reach}%` }} />
              </div>
            </div>

            {/* Complaints */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-gray-700">
                <span>Complaint Pressure (30%)</span>
                <span className="font-mono font-bold text-gray-900">{selectedOutage.subscores.complaints}/100</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${selectedOutage.subscores.complaints}%` }} />
              </div>
            </div>

            {/* Revenue */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-gray-700">
                <span>Revenue Exposure (20%)</span>
                <span className="font-mono font-bold text-gray-900">{selectedOutage.subscores.revenue}/100</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${selectedOutage.subscores.revenue}%` }} />
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-gray-700">
                <span>Duration &amp; Severity (15%)</span>
                <span className="font-mono font-bold text-gray-900">{selectedOutage.subscores.duration}/100</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedOutage.subscores.duration}%` }} />
              </div>
            </div>
          </div>

          {/* Composite Impact Score Box */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider font-mono">
              Composite Impact Score
            </span>
            <div className="text-3xl font-black text-purple-700 font-mono">
              {selectedOutage.impactScore}
            </div>
            <p className="text-[10px] text-purple-500 font-medium">
              Out of 100 · Relative to active outages
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleEscalate}
              className="w-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            >
              Escalate
            </button>
            <button
              onClick={handleAssign}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Assign
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
