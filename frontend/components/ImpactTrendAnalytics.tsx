"use client";

import React, { useState } from "react";

interface TrendPoint {
  period: string;
  outages: number;
  avgScore: number;
  mttrHours: number;
  resolvedCount: number;
}

const sevenDayData: TrendPoint[] = [
  { period: "Mon", outages: 12, avgScore: 74.2, mttrHours: 2.4, resolvedCount: 11 },
  { period: "Tue", outages: 9, avgScore: 66.8, mttrHours: 2.1, resolvedCount: 9 },
  { period: "Wed", outages: 11, avgScore: 71.0, mttrHours: 2.2, resolvedCount: 10 },
  { period: "Thu", outages: 8, avgScore: 58.5, mttrHours: 1.9, resolvedCount: 8 },
  { period: "Fri", outages: 7, avgScore: 52.3, mttrHours: 1.8, resolvedCount: 7 },
  { period: "Sat", outages: 5, avgScore: 44.1, mttrHours: 1.7, resolvedCount: 5 },
  { period: "Sun", outages: 6, avgScore: 57.8, mttrHours: 1.8, resolvedCount: 6 }
];

const thirtyDayData: TrendPoint[] = [
  { period: "Week 1", outages: 42, avgScore: 68.4, mttrHours: 2.6, resolvedCount: 39 },
  { period: "Week 2", outages: 38, avgScore: 61.2, mttrHours: 2.3, resolvedCount: 37 },
  { period: "Week 3", outages: 31, avgScore: 54.0, mttrHours: 1.9, resolvedCount: 31 },
  { period: "Week 4 (Current)", outages: 24, avgScore: 47.5, mttrHours: 1.8, resolvedCount: 24 }
];

export default function ImpactTrendAnalytics() {
  const [timeHorizon, setTimeHorizon] = useState<"7D" | "30D">("7D");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(0);

  const currentDataset = timeHorizon === "7D" ? sevenDayData : thirtyDayData;
  const activePoint = currentDataset[Math.min(selectedPointIndex, currentDataset.length - 1)];

  const maxOutages = Math.max(...currentDataset.map((d) => d.outages), 1);
  const totalVolume = currentDataset.reduce((acc, d) => acc + d.outages, 0);
  const avgPeriodScore = Number((currentDataset.reduce((acc, d) => acc + d.avgScore, 0) / currentDataset.length).toFixed(1)) || 58.0;

  return (
    <section id="trend-analytics" className="py-20 bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-semibold mb-3">
              HISTORICAL TREND & VELOCITY ANALYTICS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Rolling Outage Volume & Impact Trends
            </h2>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Real-time rolling window analysis measuring MTTR acceleration, high-severity volume reduction, and operational resolution efficacy over time.
            </p>
          </div>

          {/* Time Horizon Toggle */}
          <div className="flex items-center gap-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800 self-start md:self-auto">
            <button
              onClick={() => {
                setTimeHorizon("7D");
                setSelectedPointIndex(0);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                timeHorizon === "7D"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              7-Day Rolling View
            </button>
            <button
              onClick={() => {
                setTimeHorizon("30D");
                setSelectedPointIndex(0);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                timeHorizon === "30D"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              30-Day Monthly View
            </button>
          </div>
        </div>

        {/* 4 Core Trend Performance Metric Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-lg">
            <span className="text-gray-400 font-mono text-[11px] uppercase tracking-wider">Volume Reduction</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
              -42.8%
            </div>
            <span className="text-[11px] font-mono text-gray-400 mt-1 block">Fewer escalated outages vs baseline</span>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-lg">
            <span className="text-gray-400 font-mono text-[11px] uppercase tracking-wider">Average MTTR</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono mt-1">
              1.8 <span className="text-xs text-gray-400 font-normal">hrs</span>
            </div>
            <span className="text-[11px] font-mono text-blue-300 mt-1 block">⚡ 30.7% faster resolution rate</span>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-lg">
            <span className="text-gray-400 font-mono text-[11px] uppercase tracking-wider">Period Incidents</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
              {totalVolume} <span className="text-xs text-gray-400 font-normal">Outages</span>
            </div>
            <span className="text-[11px] font-mono text-gray-400 mt-1 block">Across monitored telecom grid</span>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-lg">
            <span className="text-gray-400 font-mono text-[11px] uppercase tracking-wider">Critical Alert Rate</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono mt-1">
              99.4%
            </div>
            <span className="text-[11px] font-mono text-emerald-400 mt-1 block">Dispatched within SLA window</span>
          </div>
        </div>

        {/* Visual Trend Chart & Drill-down Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-gray-900/70 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Chart Section (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Outage Volume & Severity Trend Curve ({timeHorizon})
                </h3>
                <p className="text-xs text-gray-400">Click any interval bar below to inspect granular telemetry breakdown.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
                  <span>Outage Volume</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                  <span>Impact Score</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive Trend Bar Grid */}
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-4 px-2 sm:px-4 bg-gray-950/80 rounded-2xl border border-gray-800/80 relative">
              {currentDataset.map((item, idx) => {
                const heightPct = Math.round((item.outages / maxOutages) * 100);
                const isSelected = selectedPointIndex === idx;

                return (
                  <div
                    key={item.period}
                    onClick={() => setSelectedPointIndex(idx)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  >
                    {/* Floating score pill on hover / active */}
                    <div
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all mb-2 ${
                        isSelected
                          ? "bg-rose-500 text-white shadow-lg"
                          : "bg-gray-800 text-gray-300 opacity-80 group-hover:opacity-100"
                      }`}
                    >
                      {item.avgScore}
                    </div>

                    {/* Bar visual */}
                    <div className="w-full max-w-[48px] bg-gray-900 rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 border border-gray-800 group-hover:border-purple-500/50 transition-colors">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-t from-purple-700 to-purple-500 shadow-lg shadow-purple-900/50"
                            : "bg-purple-900/60 group-hover:bg-purple-600/80"
                        }`}
                      />
                    </div>

                    {/* Period Label */}
                    <span
                      className={`text-[11px] font-mono mt-2 transition-colors ${
                        isSelected ? "text-purple-300 font-bold" : "text-gray-500 group-hover:text-gray-300"
                      }`}
                    >
                      {item.period}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Period Inspector Card (1 col) */}
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase">Selected Period Telemetry</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {activePoint.period}
                </span>
              </div>

              <div className="space-y-4 mt-5">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">Total Outages Recorded:</span>
                  <span className="text-base font-bold text-white">{activePoint.outages}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">Average Composite Impact:</span>
                  <span className="text-base font-bold text-rose-400">{activePoint.avgScore} / 100</span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">Mean Resolution Time (MTTR):</span>
                  <span className="text-base font-bold text-blue-400">{activePoint.mttrHours} hours</span>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">Successfully Closed Incidents:</span>
                  <span className="text-base font-bold text-emerald-400">{activePoint.resolvedCount}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800/80 text-xs text-gray-300 font-mono space-y-1.5">
              <span className="text-purple-400 font-bold block">✓ Predictive Trend Analysis</span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Prioritized queue sorting reduced average queue dwell time by 38.4%, keeping MTTR within the &lt;2.0 hour operational target.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
