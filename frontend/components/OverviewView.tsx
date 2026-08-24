"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Filter,
  RotateCcw
} from "lucide-react";
import { INITIAL_OUTAGES, OutageItem, HOURLY_COMPLAINTS, SEVEN_DAY_TREND } from "@/lib/data";
import { useFilter } from "@/context/FilterContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, ShieldCheck, Zap, Globe, TrendingUp, Award } from "lucide-react";

export default function OverviewView() {
  const { user } = useAuth();
  const {
    sortedOutages,
    hasActiveFilters,
    resetFilters,
    selectedRegion,
    selectedPriority,
    statusFilter
  } = useFilter();

  const [selectedOutage, setSelectedOutage] = useState<OutageItem>(
    sortedOutages[0] || INITIAL_OUTAGES[0]
  );
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    if (sortedOutages.length > 0) {
      const exists = sortedOutages.some((o) => o.id === selectedOutage?.id);
      if (!exists) {
        setSelectedOutage(sortedOutages[0]);
      }
    }
  }, [sortedOutages, selectedOutage?.id]);

  const topOutages = sortedOutages.slice(0, 6);
  const currentOutage = selectedOutage || topOutages[0] || INITIAL_OUTAGES[0];

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((currentOutage?.impactScore || 50) / 100) * circumference;

  // Dynamic KPI counts based on active filtered dataset
  const activeCount = sortedOutages.length;
  const criticalCount = sortedOutages.filter(
    (o) => o.priority === "P1" || o.severity === "Critical" || o.impactScore >= 75
  ).length;
  const totalSubscribers = sortedOutages.reduce((sum, o) => sum + (o.subscribers || 0), 0);
  const formattedSubscribers =
    totalSubscribers >= 1000000
      ? `${(totalSubscribers / 1000000).toFixed(2)}M`
      : totalSubscribers > 0
      ? `${(totalSubscribers / 1000).toFixed(1)}k`
      : "0";

  return (
    <div className="space-y-6">
      {/* Role-Specific Quick Jump Banner */}
      {user && (
        <div className="bg-gradient-to-r from-[#1C143B] to-[#251A4F] text-white border border-[#37286D] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md ${
              user.roleType === "noc_engineer" ? "bg-purple-600" :
              user.roleType === "regional_ops" ? "bg-blue-600" :
              user.roleType === "cx_lead" ? "bg-emerald-600" :
              "bg-amber-600"
            }`}>
              {user.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Welcome, {user.name}</span>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${user.roleBadgeColor}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                {user.jobSummary}
              </p>
            </div>
          </div>

          <Link
            href={user.primaryRoute}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-600/30 self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <span>Open {user.primaryRouteName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 1. Critical Alert Banner */}
      {!alertDismissed && (
        <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xl shrink-0">🚨</span>
            <p className="text-xs sm:text-sm font-semibold text-[#9B2C2C]">
              2 new outages crossed into Critical tier in the last 30 minutes — Mumbai &amp; Delhi NCR require immediate attention.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <Link
              href="/queue"
              className="text-xs font-bold text-[#E53E3E] hover:underline flex items-center gap-1"
            >
              <span>View Outages</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Active Filter Notice if filters are engaged */}
      {hasActiveFilters && (
        <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-purple-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>
              Showing overview for active filters:{" "}
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
              {(!statusFilter.open || !statusFilter.inProgress || !statusFilter.resolved) && (
                <strong className="bg-white border border-purple-200 px-1.5 py-0.5 rounded text-purple-950 mr-1.5">
                  Status filtered
                </strong>
              )}
              ({sortedOutages.length} matching)
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

      {/* 2. Top 5 KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs hover:border-purple-200 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            MATCHING OUTAGES
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            {activeCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-semibold">Live</span> monitored signal
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs hover:border-rose-200 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            CRITICAL
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
            {criticalCount}
          </div>
          <div className="text-[11px] text-rose-600/90 mt-1 font-medium">
            Requires P1 action
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs hover:border-purple-200 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            CUSTOMERS IMPACTED
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 mt-1">
            {formattedSubscribers}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-medium">
            {selectedRegion === "ALL" ? "Across all circles" : `In ${selectedRegion}`}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs hover:border-blue-200 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            AVG RESOLUTION TIME
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            3h 42m
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-medium">
            SLA target: 4h
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs hover:border-amber-200 transition-colors">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            REVENUE AT RISK
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
            ₹8.76 Cr
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-medium">
            Estimated exposure
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Left Prioritized Queue Table & Right Impact Score Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Prioritized Outage Queue (approx 65% / 8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Prioritized Outage Queue
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Ranked by Impact Score — highest first ({topOutages.length} shown)
                </p>
              </div>
              <Link
                href="/queue"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
              >
                <span>View all in Queue</span>
                <span>→</span>
              </Link>
            </div>

            {/* Table */}
            {topOutages.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-semibold">Outage ID</th>
                      <th className="pb-3 font-semibold">Region</th>
                      <th className="pb-3 font-semibold">Severity</th>
                      <th className="pb-3 font-semibold">Impact</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Complaints</th>
                      <th className="pb-3 font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topOutages.map((outage) => {
                      const isSelected = currentOutage?.id === outage.id;
                      return (
                        <tr
                          key={outage.id}
                          onClick={() => setSelectedOutage(outage)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-purple-50/70" : "hover:bg-gray-50/80"
                          }`}
                        >
                          {/* Outage ID */}
                          <td className="py-3 font-mono font-bold text-purple-600">
                            {outage.shortId}
                          </td>

                          {/* Region */}
                          <td className="py-3 font-semibold text-gray-800">
                            {outage.region}
                          </td>

                          {/* Severity */}
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

                          {/* Impact Progress Bar & Score */}
                          <td className="py-3">
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
                              <span className="font-bold text-gray-900 font-mono">
                                {outage.impactScore}
                              </span>
                            </div>
                          </td>

                          {/* Status Badge */}
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

                          {/* Complaints */}
                          <td className="py-3 text-gray-600 font-mono">
                            {outage.complaints.toLocaleString()}
                          </td>

                          {/* Priority Pill */}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-500">
                No active outages match current filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Impact Score Gauge & Quick Stats (approx 35% / 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: IMPACT SCORE */}
          {currentOutage ? (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    IMPACT SCORE
                  </span>
                  <div className="text-xs font-mono font-bold text-gray-900 mt-0.5">
                    {currentOutage.id}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 font-mono">
                  {currentOutage.severity} · {currentOutage.priority}
                </span>
              </div>

              {/* Circular Gauge */}
              <div className="flex flex-col items-center justify-center py-2 relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#F3F4F6"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke={currentOutage.impactScore >= 75 ? "#E53E3E" : currentOutage.impactScore >= 50 ? "#DD6B20" : "#38A169"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-gray-900 font-mono">
                    {currentOutage.impactScore}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 font-mono">
                    /100
                  </span>
                </div>
              </div>

              {/* Sub-score Breakdown Bars */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                {/* Customer Reach */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-700">
                    <span>Customer Reach</span>
                    <span className="font-mono font-bold">{currentOutage.subscores?.reach || 60}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${currentOutage.subscores?.reach || 60}%` }}
                    />
                  </div>
                </div>

                {/* Complaint Pressure */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-700">
                    <span>Complaint Pressure</span>
                    <span className="font-mono font-bold">{currentOutage.subscores?.complaints || 60}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${currentOutage.subscores?.complaints || 60}%` }}
                    />
                  </div>
                </div>

                {/* Revenue Exposure */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-700">
                    <span>Revenue Exposure</span>
                    <span className="font-mono font-bold">{currentOutage.subscores?.revenue || 60}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${currentOutage.subscores?.revenue || 60}%` }}
                    />
                  </div>
                </div>

                {/* Duration & Severity */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-700">
                    <span>Duration &amp; Severity</span>
                    <span className="font-mono font-bold">{currentOutage.subscores?.duration || 60}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${currentOutage.subscores?.duration || 60}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center font-medium">
                Weight breakdown: Reach 35% · Complaints 30% · Revenue 20% · Duration 15%
              </p>
            </div>
          ) : null}

          {/* Card 2: QUICK STATS */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              QUICK STATS
            </span>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600 font-medium">SLA Compliance</span>
                <span className="font-mono font-extrabold text-emerald-600">84%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600 font-medium">Avg Impact Score</span>
                <span className="font-mono font-extrabold text-amber-600">
                  {sortedOutages.length > 0
                    ? (
                        sortedOutages.reduce((acc, o) => acc + o.impactScore, 0) / sortedOutages.length
                      ).toFixed(1)
                    : "61.3"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-gray-600 font-medium">P1 Outages Open</span>
                <span className="font-mono font-extrabold text-rose-600">{criticalCount}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 font-medium">Complaints / Hour</span>
                <span className="font-mono font-extrabold text-purple-600">342</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Bottom Row: 2 Charts (7-Day Trend & Today's Complaint Velocity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Chart: Outage Volume & Avg Impact Trend */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Outage Volume &amp; Avg Impact — 7 Day Trend
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Rolling window, refreshed every 15 min
            </p>
          </div>

          <div className="h-44 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeDasharray="3 3" />

              {/* Y Axis Labels */}
              <text x="25" y="24" fontSize="9" fill="#9CA3AF" textAnchor="end">80</text>
              <text x="25" y="64" fontSize="9" fill="#9CA3AF" textAnchor="end">40</text>
              <text x="25" y="104" fontSize="9" fill="#9CA3AF" textAnchor="end">0</text>

              {/* Avg Impact Line (Orange) */}
              <path
                d="M 60,55 L 130,48 L 200,52 L 270,38 L 340,44 L 410,34 L 480,28"
                fill="none"
                stroke="#ED8936"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Outage Volume Line (Purple) */}
              <path
                d="M 60,110 L 130,106 L 200,108 L 270,102 L 340,104 L 410,100 L 480,92"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {SEVEN_DAY_TREND.map((d, i) => {
                const x = 60 + i * 70;
                return (
                  <g key={d.date}>
                    <circle cx={x} cy={120 - d.avgImpact * 1.2} r="3.5" fill="#ED8936" className="cursor-pointer hover:r-5 transition-all" />
                    <circle cx={x} cy={120 - d.volume * 1.2} r="3.5" fill="#7C3AED" className="cursor-pointer hover:r-5 transition-all" />
                    <text x={x} y={118} fontSize="8.5" fill="#9CA3AF" textAnchor="middle">{d.date}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Chart: Complaint Velocity Today (Purple Bar Chart) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Complaint Velocity — Today
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Complaints per hour across all regions
            </p>
          </div>

          <div className="h-44 w-full relative pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 120">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeDasharray="3 3" />

              <text x="30" y="24" fontSize="8.5" fill="#9CA3AF" textAnchor="end">1400</text>
              <text x="30" y="64" fontSize="8.5" fill="#9CA3AF" textAnchor="end">700</text>
              <text x="30" y="104" fontSize="8.5" fill="#9CA3AF" textAnchor="end">0</text>

              {/* Bars */}
              {HOURLY_COMPLAINTS.map((item, i) => {
                const barWidth = 32;
                const x = 50 + i * 48;
                const maxVal = 1400;
                const height = (item.count / maxVal) * 85;
                const y = 100 - height;
                return (
                  <g key={item.hour}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="3"
                      fill="#7C3AED"
                      className="hover:fill-purple-600 transition-colors cursor-pointer"
                    />
                    <text x={x + barWidth / 2} y="114" fontSize="7.5" fill="#9CA3AF" textAnchor="middle">
                      {item.hour}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
