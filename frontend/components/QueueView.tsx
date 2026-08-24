"use client";

import React, { useState, useEffect } from "react";
import { INITIAL_OUTAGES, OutageItem } from "@/lib/data";
import { escalateOutageApi, assignOutageApi } from "@/lib/api";
import { useFilter } from "@/context/FilterContext";
import { useAuth } from "@/context/AuthContext";
import {
  UserCheck,
  ShieldAlert,
  Filter,
  X,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertOctagon,
  Zap,
  Activity
} from "lucide-react";

export default function QueueView() {
  const { user, isNocEngineer } = useAuth();
  const {
    selectedRegion,
    setSelectedRegion,
    selectedPriority,
    setSelectedPriority,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortedOutages,
    hasActiveFilters,
    resetFilters,
    refreshOutages
  } = useFilter();

  const [selectedOutage, setSelectedOutage] = useState<OutageItem>(
    sortedOutages[0] || INITIAL_OUTAGES[0]
  );
  const [notification, setNotification] = useState<string | null>(null);

  // Sync selectedOutage when sortedOutages list changes
  useEffect(() => {
    if (sortedOutages.length > 0) {
      const stillExists = sortedOutages.some((o) => o.id === selectedOutage?.id);
      if (!stillExists) {
        setSelectedOutage(sortedOutages[0]);
      }
    }
  }, [sortedOutages, selectedOutage?.id]);

  const handleEscalate = async () => {
    if (!selectedOutage) return;
    setNotification(`⚡ Emergency Escalation Triggered for ${selectedOutage.id} (P1 Field Tech Dispatched)!`);
    await escalateOutageApi(selectedOutage.id);
    await refreshOutages();
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAssign = async () => {
    if (!selectedOutage) return;
    setNotification(`✓ Outage ${selectedOutage.id} assigned to Tier 3 Optical Lead.`);
    await assignOutageApi(selectedOutage.id);
    await refreshOutages();
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* NOC Operational Mode Banner for Rahul */}
      {isNocEngineer && (
        <div className="bg-purple-950/80 border border-purple-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-100 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">NOC Operational Dispatch Mode</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Full Dispatch Controls
                </span>
              </div>
              <p className="text-xs text-purple-300/90 mt-0.5">
                Real-time incident queue ranked by composite Impact Score. Emergency P1 field tech escalation &amp; Tier-3 optical lead assignments are active.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto shrink-0">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>9 Signals Monitored</span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-purple-900 text-white rounded-xl text-xs font-semibold shadow-lg animate-in fade-in flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-300" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-purple-200 hover:text-white ml-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Active Filter Chips / Pills Bar */}
      {hasActiveFilters && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs text-purple-900 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-purple-950">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              <span>Active Filters:</span>
            </div>

            {/* Region Pill */}
            {selectedRegion !== "ALL" && (
              <span className="inline-flex items-center gap-1 bg-white border border-purple-200 px-2.5 py-1 rounded-lg text-purple-900 font-medium">
                Region: <strong className="font-bold">{selectedRegion}</strong>
                <button
                  onClick={() => setSelectedRegion("ALL")}
                  className="text-purple-400 hover:text-purple-700 ml-1 cursor-pointer"
                  title="Clear region filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Priority Pill */}
            {selectedPriority !== "ALL" && (
              <span className="inline-flex items-center gap-1 bg-white border border-purple-200 px-2.5 py-1 rounded-lg text-purple-900 font-medium">
                Priority / Severity: <strong className="font-bold">{selectedPriority}</strong>
                <button
                  onClick={() => setSelectedPriority("ALL")}
                  className="text-purple-400 hover:text-purple-700 ml-1 cursor-pointer"
                  title="Clear priority filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Status Pill */}
            {(!statusFilter.open || !statusFilter.inProgress || !statusFilter.resolved) && (
              <span className="inline-flex items-center gap-1 bg-white border border-purple-200 px-2.5 py-1 rounded-lg text-purple-900 font-medium">
                Status:{" "}
                <strong className="font-bold">
                  {[
                    statusFilter.open ? "Open" : null,
                    statusFilter.inProgress ? "In Progress" : null,
                    statusFilter.resolved ? "Resolved" : null
                  ]
                    .filter(Boolean)
                    .join(", ") || "None"}
                </strong>
                <button
                  onClick={() => setStatusFilter({ open: true, inProgress: true, resolved: true })}
                  className="text-purple-400 hover:text-purple-700 ml-1 cursor-pointer"
                  title="Reset status filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search Pill */}
            {searchQuery.trim() !== "" && (
              <span className="inline-flex items-center gap-1 bg-white border border-purple-200 px-2.5 py-1 rounded-lg text-purple-900 font-medium">
                Search: <strong className="font-bold">&ldquo;{searchQuery}&rdquo;</strong>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-purple-400 hover:text-purple-700 ml-1 cursor-pointer"
                  title="Clear search query"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
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
                {sortedOutages.length} {sortedOutages.length === 1 ? "outage" : "outages"} matching filters
              </p>
            </div>

            {/* Filter and Sort Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search outages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-purple-500 font-sans"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
              </div>

              {/* Region Filter Dropdown */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
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

              {/* Severity / Priority Filter Dropdown */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Severities / Priorities</option>
                <option value="P1">P1 — Critical</option>
                <option value="P2">P2 — High</option>
                <option value="P3">P3 — Medium/Low</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
              >
                <option value="score">Sort: Impact Score</option>
                <option value="complaints">Sort: Complaints</option>
                <option value="duration">Sort: Duration</option>
              </select>
            </div>
          </div>

          {/* Table or Empty State */}
          {sortedOutages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="border-b border-gray-200/80 text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="pb-3 px-2 font-medium">Rank</th>
                    <th className="pb-3 px-2 font-medium">Outage ID</th>
                    <th className="pb-3 px-2 font-medium">Region</th>
                    <th className="pb-3 px-2 font-medium">Severity</th>
                    <th className="pb-3 px-2 font-medium">Impact Score</th>
                    <th className="pb-3 px-2 font-medium">Status</th>
                    <th className="pb-3 px-2 font-medium">Complaints</th>
                    <th className="pb-3 px-2 font-medium">Duration</th>
                    <th className="pb-3 px-2 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedOutages.map((outage, index) => {
                    const isSelected = selectedOutage?.id === outage.id;
                    return (
                      <tr
                        key={outage.id}
                        onClick={() => setSelectedOutage(outage)}
                        className={`hover:bg-purple-50/40 transition-colors cursor-pointer ${
                          isSelected ? "bg-purple-50/70 font-semibold" : ""
                        }`}
                      >
                        <td className="py-3 px-2 font-mono text-gray-400">
                          #{index + 1}
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-purple-700">
                          {outage.id}
                        </td>
                        <td className="py-3 px-2 text-gray-800">
                          {outage.region}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              outage.severity === "Critical"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : outage.severity === "High"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : outage.severity === "Medium"
                                ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {outage.severity}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
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
                            <span className="font-mono font-bold text-gray-900">
                              {outage.impactScore}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                              outage.status === "Open"
                                ? "text-rose-600"
                                : outage.status === "In Progress" || outage.status === "Active Triage"
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                outage.status === "Open"
                                  ? "bg-rose-500"
                                  : outage.status === "In Progress" || outage.status === "Active Triage"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            {outage.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-gray-600">
                          {outage.complaints.toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-gray-500 text-[11px] font-mono">
                          {outage.duration}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              outage.priority === "P1"
                                ? "bg-rose-100 text-rose-800"
                                : outage.priority === "P2"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
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
          ) : (
            <div className="py-12 px-4 text-center space-y-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <AlertOctagon className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900">No matching outages found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  No active outages match your current region, priority, status, or search filters.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Section: Outage Detail Panel (4 cols) */}
        {selectedOutage ? (
          <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                OUTAGE INSPECTOR
              </span>
              <h3 className="text-lg font-extrabold text-gray-900 font-mono mt-1">
                {selectedOutage.id}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {selectedOutage.region} Circle • Node: {selectedOutage.node}
              </p>
            </div>

            {/* Key Metrics Pill Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">Impact Score</span>
                <div className="text-base font-black font-mono text-purple-700 mt-0.5">
                  {selectedOutage.impactScore} <span className="text-xs text-gray-400 font-normal">/ 100</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">Priority Tier</span>
                <div className={`text-base font-black font-mono mt-0.5 ${
                  selectedOutage.priority === "P1" ? "text-rose-600" : selectedOutage.priority === "P2" ? "text-amber-600" : "text-blue-600"
                }`}>
                  {selectedOutage.priority} {selectedOutage.severity}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">Affected Subscribers</span>
                <div className="text-xs font-bold text-gray-800 font-mono mt-0.5">
                  {selectedOutage.subscribers.toLocaleString()} subs
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">Revenue Exposure</span>
                <div className="text-xs font-bold text-gray-800 font-mono mt-0.5">
                  {selectedOutage.revenueExposure}
                </div>
              </div>
            </div>

            {/* Root Cause Box */}
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider font-mono">
                Root Cause Identification
              </span>
              <p className="text-xs text-purple-950 leading-relaxed font-medium">
                {selectedOutage.rootCause}
              </p>
            </div>

            {/* 4-Factor Sub-Score Breakdown */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
                4-Factor Sub-Score Contributions
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-600">Customer Reach (35%)</span>
                    <span className="font-mono font-bold text-gray-900">{selectedOutage.subscores.reach} / 100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${selectedOutage.subscores.reach}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-600">Complaint Pressure (30%)</span>
                    <span className="font-mono font-bold text-gray-900">{selectedOutage.subscores.complaints} / 100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedOutage.subscores.complaints}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-600">Revenue Exposure (20%)</span>
                    <span className="font-mono font-bold text-gray-900">{selectedOutage.subscores.revenue} / 100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${selectedOutage.subscores.revenue}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-600">Duration & Severity (15%)</span>
                    <span className="font-mono font-bold text-gray-900">{selectedOutage.subscores.duration} / 100</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${selectedOutage.subscores.duration}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Dispatch Buttons */}
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
              <button
                onClick={handleEscalate}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalate Ticket</span>
              </button>

              <button
                onClick={handleAssign}
                className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-gray-500" />
                <span>Assign Lead</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs text-center py-10 text-gray-400 text-xs">
            Select an outage from the table to view detailed metrics.
          </div>
        )}

      </div>
    </div>
  );
}
