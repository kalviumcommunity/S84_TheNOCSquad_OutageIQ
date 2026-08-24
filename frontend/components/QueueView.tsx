"use client";

import React, { useState, useEffect } from "react";
import { INITIAL_OUTAGES, OutageItem } from "@/lib/data";
import { fetchOutages, escalateOutageApi, assignOutageApi } from "@/lib/api";
import { AlertTriangle, UserCheck, ShieldAlert, ArrowUpDown, CheckCircle, Search, Filter, X } from "lucide-react";

export default function QueueView() {
  const [outages, setOutages] = useState<OutageItem[]>(INITIAL_OUTAGES);
  const [selectedOutage, setSelectedOutage] = useState<OutageItem>(INITIAL_OUTAGES[0]);
  const [filterRegion, setFilterRegion] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"score" | "complaints" | "duration">("score");
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Read ?region= from URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const regionParam = urlParams.get("region");
      if (regionParam) {
        setFilterRegion(regionParam);
      }
    }
  }, []);

  // Fetch live outages from backend
  const loadOutages = async () => {
    const data = await fetchOutages({ region: filterRegion, severity: filterSeverity, sort: sortField });
    if (data && data.length > 0) {
      setOutages(data);
      setSelectedOutage(data[0]);
    }
  };

  useEffect(() => {
    loadOutages();
  }, [filterRegion, filterSeverity, sortField]);

  const handleEscalate = async () => {
    setNotification(`⚡ Emergency Escalation Triggered for ${selectedOutage.id} (P1 Field Tech Dispatched)!`);
    await escalateOutageApi(selectedOutage.id);
    await loadOutages();
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAssign = async () => {
    setNotification(`✓ Outage ${selectedOutage.id} assigned to Tier 3 Optical Lead.`);
    await assignOutageApi(selectedOutage.id);
    await loadOutages();
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter & Sort
  const filtered = outages.filter((o) => {
    const matchRegion = filterRegion === "ALL" || o.region.toLowerCase() === filterRegion.toLowerCase();
    const matchSev = filterSeverity === "ALL" || o.severity.toUpperCase() === filterSeverity.toUpperCase();
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      query === "" ||
      o.id.toLowerCase().includes(query) ||
      o.region.toLowerCase().includes(query) ||
      o.node.toLowerCase().includes(query) ||
      o.rootCause.toLowerCase().includes(query);
    return matchRegion && matchSev && matchSearch;
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

      {/* Active Filter Pill if region is filtered */}
      {filterRegion !== "ALL" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-2.5 px-4 flex items-center justify-between text-xs text-purple-900">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-600" />
            <span>Filtering queue by circle: <strong className="text-purple-950 font-bold">{filterRegion}</strong></span>
          </div>
          <button
            onClick={() => setFilterRegion("ALL")}
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 bg-white border border-purple-200 px-2.5 py-1 rounded-lg shadow-2xs transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Region Filter</span>
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
                {sorted.length} outages matching filters
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
                  className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              {/* Region Filter Dropdown */}
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
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
              </select>

              {/* Severity Filter Dropdown */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Severities</option>
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

          {/* Table */}
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
                {sorted.map((outage, index) => {
                  const isSelected = selectedOutage.id === outage.id;
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
        </div>

        {/* Right Section: Outage Detail Panel (4 cols) */}
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
              <div className="text-base font-black font-mono text-rose-600 mt-0.5">
                {selectedOutage.priority} Critical
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

      </div>
    </div>
  );
}
