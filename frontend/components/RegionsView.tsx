"use client";

import React, { useState, useEffect } from "react";
import { REGIONS_DATA, RegionMetric } from "@/lib/data";
import { fetchRegions } from "@/lib/api";
import Link from "next/link";
import { Users, TrendingUp, ShieldCheck, ArrowRight, Filter } from "lucide-react";

export default function RegionsView() {
  const [regions, setRegions] = useState<RegionMetric[]>(REGIONS_DATA);
  const [selectedRegion, setSelectedRegion] = useState<RegionMetric>(REGIONS_DATA[0]);

  useEffect(() => {
    fetchRegions().then((data) => {
      if (data && data.length > 0) {
        setRegions(data);
        setSelectedRegion(data[0]);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Grid: Left Region Impact Ranking (6 cols) & Right Impact Score Chart (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: Region Impact Ranking */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Region Impact Ranking
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Highest impact regions ranked by composite score
              </p>
            </div>
            <Link
              href={`/queue?region=${encodeURIComponent(selectedRegion.name)}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200/80 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Queue by {selectedRegion.name}</span>
            </Link>
          </div>

          {/* List */}
          <div className="space-y-2.5 pt-1">
            {regions.map((region, idx) => {
              const isSelected = selectedRegion.id === region.id;
              return (
                <div
                  key={region.id}
                  onClick={() => setSelectedRegion(region)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-purple-50/80 border-purple-300 shadow-xs ring-1 ring-purple-200"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-gray-400 w-5">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-900 truncate">
                        {region.name}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {region.subscribersFormatted}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Score & Badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20 sm:w-28 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          region.impactScore >= 75
                            ? "bg-rose-500"
                            : region.impactScore >= 60
                            ? "bg-amber-500"
                            : region.impactScore >= 40
                            ? "bg-yellow-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${region.impactScore}%` }}
                      />
                    </div>
                    <span className="font-mono font-black text-xs text-gray-900 w-6 text-right">
                      {region.impactScore}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${region.tierBadgeColor}`}>
                      {region.revenueTier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Impact Score by Region Horizontal Bar Chart */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Impact Score by Region
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Comparative view across all active circles (Click any bar to select)
            </p>
          </div>

          {/* Horizontal Chart */}
          <div className="h-72 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 240">
              {/* Axis Grid lines */}
              <line x1="90" y1="10" x2="90" y2="210" stroke="#E5E7EB" />
              <line x1="190" y1="10" x2="190" y2="210" stroke="#F3F4F6" strokeDasharray="2 2" />
              <line x1="290" y1="10" x2="290" y2="210" stroke="#F3F4F6" strokeDasharray="2 2" />
              <line x1="390" y1="10" x2="390" y2="210" stroke="#F3F4F6" strokeDasharray="2 2" />
              <line x1="490" y1="10" x2="490" y2="210" stroke="#F3F4F6" strokeDasharray="2 2" />

              {/* Bottom Scale text */}
              <text x="90" y="228" fontSize="8.5" fill="#9CA3AF" textAnchor="middle">0</text>
              <text x="190" y="228" fontSize="8.5" fill="#9CA3AF" textAnchor="middle">25</text>
              <text x="290" y="228" fontSize="8.5" fill="#9CA3AF" textAnchor="middle">50</text>
              <text x="390" y="228" fontSize="8.5" fill="#9CA3AF" textAnchor="middle">75</text>
              <text x="490" y="228" fontSize="8.5" fill="#9CA3AF" textAnchor="middle">100</text>

              {/* Region Bars */}
              {regions.map((reg, i) => {
                const y = 15 + i * 24;
                const barWidth = (reg.impactScore / 100) * 400;
                const isSelected = selectedRegion.id === reg.id;
                const color =
                  reg.impactScore >= 85
                    ? "#E53E3E"
                    : reg.impactScore >= 70
                    ? "#DD6B20"
                    : reg.impactScore >= 50
                    ? "#D69E2E"
                    : reg.impactScore >= 40
                    ? "#ECC94B"
                    : "#38A169";

                return (
                  <g key={reg.id} className="cursor-pointer group" onClick={() => setSelectedRegion(reg)}>
                    <text
                      x="80"
                      y={y + 11}
                      fontSize="8.5"
                      fill={isSelected ? "#7C3AED" : "#4B5563"}
                      textAnchor="end"
                      fontWeight={isSelected ? "bold" : "600"}
                    >
                      {reg.name}
                    </text>
                    <rect
                      x="90"
                      y={y}
                      width={barWidth}
                      height="15"
                      rx="3"
                      fill={color}
                      className={`transition-all ${isSelected ? "stroke-2 stroke-purple-600 opacity-100" : "opacity-90 hover:opacity-100"}`}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Selected Region Action Bar */}
          <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-700 font-medium">
              Selected: <strong className="text-purple-700">{selectedRegion.name}</strong> • Exposure: <strong className="text-gray-900">{selectedRegion.revenueExposureHourly}</strong> • SLA: <strong className="text-emerald-700">{selectedRegion.slaCompliance}%</strong>
            </div>
            <Link
              href={`/queue?region=${encodeURIComponent(selectedRegion.name)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <span>Filter Queue by {selectedRegion.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Row: 4 Regional Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {regions.slice(0, 4).map((region) => (
          <div
            key={region.id}
            onClick={() => setSelectedRegion(region)}
            className={`bg-white border rounded-2xl p-4 shadow-xs transition-all cursor-pointer ${
              selectedRegion.id === region.id
                ? "border-purple-400 ring-2 ring-purple-100 bg-purple-50/20"
                : "border-gray-200/80 hover:border-purple-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-gray-900">{region.name}</h3>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${region.tierBadgeColor}`}>
                {region.revenueTier}
              </span>
            </div>

            <div className="text-2xl font-black text-rose-600 font-mono">
              {region.impactScore}
            </div>
            <div className="text-[11px] font-semibold text-gray-400 font-mono uppercase tracking-wider">
              Impact Score
            </div>
            <div className="text-xs text-gray-600 mt-2 font-medium">
              {region.subscribersFormatted}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] gap-2">
              <span className="text-gray-500">Outages: <strong className="text-gray-900">{region.activeOutages}</strong></span>
              <Link
                href={`/queue?region=${encodeURIComponent(region.name)}`}
                className="text-purple-600 font-bold hover:text-purple-800 hover:underline flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-200/60 transition-colors shrink-0"
              >
                <span>Filter Queue by {region.name}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
