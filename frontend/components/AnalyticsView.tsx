"use client";

import React, { useState } from "react";
import { HOURLY_COMPLAINTS, SEVEN_DAY_TREND, INITIAL_OUTAGES } from "@/lib/data";
import { Download, FileText, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default function AnalyticsView() {
  const [hoveredScorePoint, setHoveredScorePoint] = useState<number | null>(3); // Default Jul 20 hovered
  const [downloading, setDownloading] = useState(false);

  const handleExportPdf = () => {
    setDownloading(true);
    // Trigger printable window or markdown/PDF download
    setTimeout(() => {
      const summaryText = `OutageIQ Executive Summary (Week of Jul 17 - Jul 23, 2026)\n\n` +
        `Total Outages: 84\n` +
        `Avg Resolution Time: 3h 52m\n` +
        `Revenue at Risk: ₹42.3 Cr\n` +
        `SLA Compliance: 84%\n\n` +
        `Top 5 Highest-Impact Outages:\n` +
        `1. OUT-2026-0723-N91 (Mumbai) - Score: 92.4\n` +
        `2. OUT-2026-0722-N44 (Delhi NCR) - Score: 87.1\n` +
        `3. OUT-2026-0723-N12 (Bangalore) - Score: 74.3\n` +
        `4. OUT-2026-0721-N88 (Chennai) - Score: 68.9\n` +
        `5. OUT-2026-0722-N55 (Pune) - Score: 55.2\n`;
      
      const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `OutageIQ_Executive_Briefing_Jul2026.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(false);
    }, 600);
  };

  const topFive = INITIAL_OUTAGES.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 2x2 Grid of Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: 7-Day Outage Volume Trend */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              7-Day Outage Volume Trend
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">
              Total active outages per day
            </p>
          </div>

          <div className="h-48 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 130">
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeDasharray="3 3" />

              <text x="30" y="24" fontSize="8.5" fill="#9CA3AF" textAnchor="end">24</text>
              <text x="30" y="64" fontSize="8.5" fill="#9CA3AF" textAnchor="end">12</text>
              <text x="30" y="104" fontSize="8.5" fill="#9CA3AF" textAnchor="end">0</text>

              {/* Purple Curve */}
              <path
                d="M 60,95 L 130,82 L 200,90 L 270,65 L 340,75 L 410,55 L 480,22"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Points */}
              {SEVEN_DAY_TREND.map((d, i) => {
                const x = 60 + i * 70;
                const y = 110 - (d.volume / 24) * 88;
                return (
                  <g key={d.date}>
                    <circle cx={x} cy={y} r="4" fill="#7C3AED" className="hover:r-5 cursor-pointer transition-all" />
                    <text x={x} y="122" fontSize="8" fill="#9CA3AF" textAnchor="middle">{d.date}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Card 2: Avg Impact Score Trend */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Avg Impact Score Trend
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">
              Mean composite impact across open outages
            </p>
          </div>

          <div className="h-48 w-full pt-2 relative">
            <svg className="w-full h-full" viewBox="0 0 500 130">
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeDasharray="3 3" />

              <text x="30" y="24" fontSize="8.5" fill="#9CA3AF" textAnchor="end">90</text>
              <text x="30" y="64" fontSize="8.5" fill="#9CA3AF" textAnchor="end">55</text>
              <text x="30" y="104" fontSize="8.5" fill="#9CA3AF" textAnchor="end">40</text>

              {/* Orange Curve */}
              <path
                d="M 60,78 L 130,68 L 200,72 L 270,45 L 340,55 L 410,40 L 480,32"
                fill="none"
                stroke="#ED8936"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Tooltip on Jul 20 (index 3) */}
              <line x1="270" y1="20" x2="270" y2="100" stroke="#CBD5E0" strokeDasharray="2 2" />
              <rect x="235" y="48" width="80" height="20" rx="4" fill="#FFFFFF" stroke="#CBD5E0" />
              <text x="275" y="57" fontSize="7" fill="#718096" textAnchor="middle">Jul 20</text>
              <text x="275" y="65" fontSize="7.5" fill="#ED8936" fontWeight="bold" textAnchor="middle">Avg Impact Score : 67</text>

              {/* Points */}
              {SEVEN_DAY_TREND.map((d, i) => {
                const x = 60 + i * 70;
                const y = 130 - (d.avgImpact / 90) * 90;
                return (
                  <g key={d.date}>
                    <circle cx={x} cy={y} r="4" fill="#ED8936" className="hover:r-5 cursor-pointer transition-all" />
                    <text x={x} y="122" fontSize="8" fill="#9CA3AF" textAnchor="middle">{d.date}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Card 3: Complaint Velocity — Today */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Complaint Velocity — Today
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">
              Hourly complaint count across all regions
            </p>
          </div>

          <div className="h-48 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 130">
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeDasharray="3 3" />

              <text x="30" y="24" fontSize="8.5" fill="#9CA3AF" textAnchor="end">1400</text>
              <text x="30" y="64" fontSize="8.5" fill="#9CA3AF" textAnchor="end">700</text>
              <text x="30" y="104" fontSize="8.5" fill="#9CA3AF" textAnchor="end">0</text>

              {HOURLY_COMPLAINTS.map((item, i) => {
                const barWidth = 32;
                const x = 50 + i * 48;
                const height = (item.count / 1400) * 85;
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
                      className="hover:fill-purple-600 transition-colors"
                    />
                    <text x={x + barWidth / 2} y="118" fontSize="7.5" fill="#9CA3AF" textAnchor="middle">
                      {item.hour}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Card 4: Severity Distribution (Pie Chart) */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Severity Distribution
            </h2>
            <p className="text-[11px] text-gray-500 font-medium">
              Breakdown of active outages by severity tier
            </p>
          </div>

          <div className="flex items-center justify-center py-3">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Total = 24 outages: High 8 (33%), Medium 7 (29%), Critical 5 (21%), Low 4 (17%) */}
                {/* High - Orange */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ED8936" strokeWidth="24" strokeDasharray="78.8 160" strokeDashoffset="0" />
                {/* Critical - Red */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E53E3E" strokeWidth="24" strokeDasharray="50.2 188" strokeDashoffset="-78.8" />
                {/* Low - Green */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#38A169" strokeWidth="24" strokeDasharray="40.8 198" strokeDashoffset="-129" />
                {/* Medium - Yellow */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ECC94B" strokeWidth="24" strokeDasharray="69.2 170" strokeDashoffset="-169.8" />
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold pt-1 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>High: 8</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Critical: 5</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span>Medium: 7</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Low: 4</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Executive Summary (Deep Purple Full Width Card) */}
      <div className="bg-[#6B21A8] text-white rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-400/30 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Executive Summary
            </h2>
            <p className="text-xs text-purple-200 font-medium mt-0.5">
              Week of Jul 17 – Jul 23, 2026
            </p>
          </div>

          <button
            onClick={handleExportPdf}
            className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-xs"
          >
            <Download className={`w-3.5 h-3.5 ${downloading ? "animate-bounce" : ""}`} />
            <span>Export PDF</span>
          </button>
        </div>

        {/* 4 Exec KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-900/40 border border-purple-400/20 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200">
              Total Outages
            </span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">
              84
            </div>
            <span className="text-[10px] text-purple-200 mt-1 block">
              ↑ 12% vs prior week
            </span>
          </div>

          <div className="bg-purple-900/40 border border-purple-400/20 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200">
              Avg Resolution
            </span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">
              3h 52m
            </div>
            <span className="text-[10px] text-purple-200 mt-1 block">
              Within 4h SLA
            </span>
          </div>

          <div className="bg-purple-900/40 border border-purple-400/20 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200">
              Revenue at Risk
            </span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">
              ₹42.3 Cr
            </div>
            <span className="text-[10px] text-purple-200 mt-1 block">
              Week total
            </span>
          </div>

          <div className="bg-purple-900/40 border border-purple-400/20 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200">
              SLA Compliance
            </span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">
              84%
            </div>
            <span className="text-[10px] text-purple-200 mt-1 block">
              Target: 90%
            </span>
          </div>
        </div>

        {/* Top 5 Highest-Impact Outages This Week */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-200 font-mono">
            Top 5 Highest-Impact Outages This Week
          </div>
          <div className="space-y-1.5">
            {topFive.map((outage, idx) => (
              <div
                key={outage.id}
                className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-400/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-purple-300 w-5">
                    #{idx + 1}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {outage.id}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-purple-200 font-semibold">{outage.region}</span>
                  <span className="font-mono font-black text-white w-10 text-right">
                    {outage.impactScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
