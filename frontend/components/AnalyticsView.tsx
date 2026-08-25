"use client";

import React, { useState, useEffect } from "react";
import { fetchOutages, fetchAnalytics, fetchExecutiveSummary, AnalyticsData } from "@/lib/api";
import { OutageItem, SEVEN_DAY_TREND, HOURLY_COMPLAINTS, INITIAL_OUTAGES } from "@/lib/data";
import { downloadExecutivePdf } from "@/lib/pdf";
import Link from "next/link";
import {
  Download,
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  Send,
  Bell,
  MessageSquare,
  Users,
  ShieldCheck,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Sparkles,
  Award,
  DollarSign,
  Layers,
  Database
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsView() {
  const { user, isCxLead, isLeadership } = useAuth();
  const [hoveredScorePoint, setHoveredScorePoint] = useState<number | null>(3);
  const [downloading, setDownloading] = useState(false);
  const [topFive, setTopFive] = useState<OutageItem[]>(INITIAL_OUTAGES.slice(0, 5));
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [execKpis, setExecKpis] = useState({
    totalOutages: 84,
    volumeChange: "↑ 12% vs prior week",
    avgResolution: "3h 52m",
    revenueAtRisk: "₹42.3 Cr",
    slaCompliance: "84%",
    period: "Week of Jul 17 – Jul 23, 2026",
  });

  // CX Proactive Comms state
  const [selectedChannel, setSelectedChannel] = useState<"sms" | "push" | "ivr" | "app">("sms");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "⚠️ Outage Alert: We are aware of service disruption affecting Mumbai & Delhi circles. Core field teams are dispatched. Estimated resolution within 2h. We apologize for the inconvenience."
  );
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOutages().then((data) => {
      if (data && data.length > 0) {
        setTopFive(data.slice(0, 5));
      }
    });

    fetchAnalytics().then((data) => {
      if (data) {
        setAnalytics(data);
      }
    });

    fetchExecutiveSummary().then((data) => {
      if (data) {
        setExecKpis({
          totalOutages: data.total_outages || 84,
          volumeChange: data.volume_change || "↑ 12% vs prior week",
          avgResolution: data.avg_resolution || "3h 52m",
          revenueAtRisk: data.revenue_at_risk || "₹42.3 Cr",
          slaCompliance: data.sla_compliance || "84%",
          period: data.period || "Week of Jul 17 – Jul 23, 2026",
        });
      }
    });
  }, []);

  // 1. Dynamic 7-Day Outage Volume Trend
  const trendData = analytics?.seven_day_trend || SEVEN_DAY_TREND;
  const maxVolume = Math.max(...trendData.map((d) => d.volume), 10);
  const volumePoints = trendData.map((d, i) => ({
    x: 60 + i * ((480 - 60) / Math.max(1, trendData.length - 1)),
    y: 110 - (d.volume / maxVolume) * 85,
    ...d,
  }));
  const volumePathD = volumePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

  // 2. Dynamic Average Impact Score Trend
  const scorePoints = trendData.map((d, i) => ({
    x: 60 + i * ((480 - 60) / Math.max(1, trendData.length - 1)),
    y: 110 - (d.avgImpact / 100) * 85,
    ...d,
  }));
  const scorePathD = scorePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

  // 3. Dynamic Hourly Complaints
  const complaintsData = analytics?.hourly_complaints || HOURLY_COMPLAINTS;
  const maxComplaint = Math.max(...complaintsData.map((h) => h.count), 500);

  // 4. Dynamic Severity Distribution Donut
  const sev = analytics?.severity_distribution || { Critical: 5, High: 8, Medium: 7, Low: 4 };
  const totalSev = (sev.Critical || 0) + (sev.High || 0) + (sev.Medium || 0) + (sev.Low || 0) || 1;
  const circumference = 2 * Math.PI * 38; // 238.76

  const highLen = ((sev.High || 0) / totalSev) * circumference;
  const critLen = ((sev.Critical || 0) / totalSev) * circumference;
  const lowLen = ((sev.Low || 0) / totalSev) * circumference;
  const medLen = ((sev.Medium || 0) / totalSev) * circumference;

  const critOffset = -highLen;
  const lowOffset = -(highLen + critLen);
  const medOffset = -(highLen + critLen + lowLen);

  const handleExportPdf = async () => {
    setDownloading(true);
    try {
      await downloadExecutivePdf({
        title: "OutageIQ Executive Incident Briefing",
        subtitle: `${execKpis.period} | Classification: Confidential`,
        kpis: [
          { label: "Total Outages", value: String(execKpis.totalOutages), sub: execKpis.volumeChange },
          { label: "Avg Resolution", value: execKpis.avgResolution, sub: "Within 4h SLA" },
          { label: "Revenue at Risk", value: execKpis.revenueAtRisk, sub: "Week total" },
          { label: "SLA Compliance", value: execKpis.slaCompliance, sub: "Target: 90%" },
        ],
        topOutages: topFive,
      });
    } catch (_) {}
    setDownloading(false);
  };

  const handleDispatchBroadcast = () => {
    setDispatchStatus("🚀 Dispatching priority broadcast to 161,000 affected subscribers...");
    setTimeout(() => {
      setDispatchStatus("✅ Broadcast Successfully Sent across Telecom Channels (SMS / Push / App Banner)!");
      setTimeout(() => setDispatchStatus(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {dispatchStatus && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{dispatchStatus}</span>
          </div>
          <button onClick={() => setDispatchStatus(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Farah CX Role-Specific Proactive Communication Hub */}
      {isCxLead && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-300">
                  <Radio className="w-4 h-4" />
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Proactive Customer Communications &amp; Sentiment Protection
                </h2>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Dispatch immediate broadcast alerts to 161.0k impacted subscribers to mitigate complaint volume and protect NPS.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
              Farah C. — CX Lead Command
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Channel Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-300 block">
                Broadcast Distribution Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "sms", name: "SMS Gateway", count: "161k subscribers" },
                  { id: "push", name: "App Push", count: "98k active app users" },
                  { id: "ivr", name: "Call Center IVR", count: "Auto-Deflection" },
                  { id: "app", name: "Web Banner", count: "Self-service portal" },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedChannel === ch.id
                        ? "bg-emerald-500/25 text-white border-emerald-400 shadow-md ring-1 ring-emerald-400/40"
                        : "bg-[#181138] text-gray-300 border-[#2D215E] hover:border-emerald-500/40"
                    }`}
                  >
                    <div className="text-xs font-bold">{ch.name}</div>
                    <div className="text-[10px] text-emerald-300 font-mono mt-0.5">{ch.count}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Broadcast Message Editor */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Customer Broadcast Message</span>
                <span className="text-[10px] font-mono text-emerald-300">
                  {broadcastMessage.length} chars
                </span>
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-[#181138] border border-[#2D215E] text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-sans"
              />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-gray-400">
                  Estimated Complaint Reduction: <strong className="text-emerald-300 font-mono">~35% call volume deflection</strong>
                </p>
                <button
                  type="button"
                  onClick={handleDispatchBroadcast}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-900/40 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Proactive Alert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2x2 Grid of Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: 7-Day Outage Volume Trend */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">7-Day Outage Volume Trend</h2>
            <p className="text-[11px] text-gray-500 font-medium">Total active outages per day (Live Telemetry)</p>
          </div>

          <div className="h-48 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 130">
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeDasharray="3 3" />

              <text x="30" y="24" fontSize="8.5" fill="#9CA3AF" textAnchor="end">
                {maxVolume}
              </text>
              <text x="30" y="64" fontSize="8.5" fill="#9CA3AF" textAnchor="end">
                {Math.round(maxVolume / 2)}
              </text>
              <text x="30" y="104" fontSize="8.5" fill="#9CA3AF" textAnchor="end">
                0
              </text>

              {/* Dynamic Purple Curve */}
              <path d={volumePathD} fill="none" stroke="#7C3AED" strokeWidth="2.5" />

              {/* Dynamic Data Points */}
              {volumePoints.map((point) => (
                <g key={point.date} className="group cursor-pointer">
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#7C3AED"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="hover:r-6 transition-all"
                  />
                  <text x={point.x} y="125" fontSize="8" fill="#9CA3AF" textAnchor="middle">
                    {point.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50 font-mono">
            <span>
              Peak: <strong>{maxVolume} active</strong>
            </span>
            <span>
              Latest: <strong>{trendData[trendData.length - 1]?.volume || 24} active</strong>
            </span>
          </div>
        </div>

        {/* Card 2: Average Impact Score Trend */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Avg Impact Score Trend</h2>
            <p className="text-[11px] text-gray-500 font-medium">Mean composite severity score across network</p>
          </div>

          <div className="h-48 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 130">
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeDasharray="3 3" />

              <text x="30" y="24" fontSize="8.5" fill="#9CA3AF" textAnchor="end">
                100
              </text>
              <text x="30" y="64" fontSize="8.5" fill="#9CA3AF" textAnchor="end">
                50
              </text>
              <text x="30" y="104" fontSize="8.5" fill="#9CA3AF" textAnchor="end">
                0
              </text>

              {/* Dynamic Orange Curve */}
              <path d={scorePathD} fill="none" stroke="#ED8936" strokeWidth="2.5" />

              {scorePoints.map((point, index) => {
                const isHovered = hoveredScorePoint === index;

                return (
                  <g
                    key={point.date}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredScorePoint(index)}
                  >
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isHovered ? "6" : "4"}
                      fill="#ED8936"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all"
                    />
                    <text x={point.x} y="125" fontSize="8" fill="#9CA3AF" textAnchor="middle">
                      {point.date}
                    </text>
                    {isHovered && (
                      <g>
                        <rect x={point.x - 20} y={point.y - 20} width="40" height="15" rx="4" fill="#2D3748" />
                        <text x={point.x} y={point.y - 10} fontSize="8" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
                          {point.avgImpact}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50 font-mono">
            <span>
              Hovered Point:{" "}
              <strong className="text-orange-600">
                {trendData[hoveredScorePoint ?? 3]?.date} ({trendData[hoveredScorePoint ?? 3]?.avgImpact} Score)
              </strong>
            </span>
            <span>
              Current Mean: <strong>{trendData[trendData.length - 1]?.avgImpact || 75.0} / 100</strong>
            </span>
          </div>
        </div>

        {/* Card 3: Today's Complaint Velocity */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Today&apos;s Complaint Velocity</h2>
            <p className="text-[11px] text-gray-500 font-medium">Complaints logged per hour (06:00 - 22:00)</p>
          </div>

          <div className="h-48 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 500 130">
              <line x1="30" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="30" y1="60" x2="480" y2="60" stroke="#F3F4F6" strokeDasharray="3 3" />
              <line x1="30" y1="100" x2="480" y2="100" stroke="#F3F4F6" strokeDasharray="3 3" />

              <text x="25" y="24" fontSize="8" fill="#9CA3AF" textAnchor="end">
                {maxComplaint >= 1000 ? `${(maxComplaint / 1000).toFixed(1)}k` : maxComplaint}
              </text>
              <text x="25" y="64" fontSize="8" fill="#9CA3AF" textAnchor="end">
                {Math.round(maxComplaint / 2)}
              </text>
              <text x="25" y="104" fontSize="8" fill="#9CA3AF" textAnchor="end">
                0
              </text>

              {complaintsData.map((item, i) => {
                const x = 38 + i * ((470 - 38) / complaintsData.length);
                const barHeight = (item.count / maxComplaint) * 85;
                const y = 105 - barHeight;
                const isPeak = item.count === maxComplaint;

                return (
                  <g key={item.hour} className="group">
                    <rect
                      x={x}
                      y={y}
                      width="24"
                      height={barHeight}
                      rx="3"
                      fill={isPeak ? "#E53E3E" : "#805AD5"}
                      className="hover:opacity-80 transition-opacity"
                    />
                    <text x={x + 12} y="122" fontSize="7.5" fill="#9CA3AF" textAnchor="middle">
                      {item.hour}
                    </text>
                    <text
                      x={x + 12}
                      y={y - 4}
                      fontSize="7"
                      fill={isPeak ? "#E53E3E" : "#4A5568"}
                      textAnchor="middle"
                      fontWeight="bold"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {item.count}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50 font-mono">
            <span>
              Peak Velocity: <strong className="text-rose-600">{maxComplaint}/hr</strong>
            </span>
            <span>
              Total Today:{" "}
              <strong>{complaintsData.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()} calls</strong>
            </span>
          </div>
        </div>

        {/* Card 4: Severity Distribution Donut Chart */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Severity Distribution</h2>
            <p className="text-[11px] text-gray-500 font-medium">
              Live breakdown of active network alerts ({totalSev} Total)
            </p>
          </div>

          <div className="flex items-center justify-center py-3">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* High - Orange */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ED8936"
                  strokeWidth="24"
                  strokeDasharray={`${highLen} ${circumference}`}
                  strokeDashoffset="0"
                />
                {/* Critical - Red */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#E53E3E"
                  strokeWidth="24"
                  strokeDasharray={`${critLen} ${circumference}`}
                  strokeDashoffset={critOffset}
                />
                {/* Low - Green */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#38A169"
                  strokeWidth="24"
                  strokeDasharray={`${lowLen} ${circumference}`}
                  strokeDashoffset={lowOffset}
                />
                {/* Medium - Yellow */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ECC94B"
                  strokeWidth="24"
                  strokeDasharray={`${medLen} ${circumference}`}
                  strokeDashoffset={medOffset}
                />
              </svg>
            </div>
          </div>

          {/* Legend with Real Counts */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold pt-1 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>High: {sev.High || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Critical: {sev.Critical || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span>Medium: {sev.Medium || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Low: {sev.Low || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Executive Summary (Highlights for Vikram & Leadership) */}
      <div className="bg-[#6B21A8] text-white rounded-2xl p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-400/30 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-300" />
              <h2 className="text-lg font-bold text-white tracking-tight">Executive Summary &amp; Business KPIs</h2>
            </div>
            <p className="text-xs text-purple-200 font-medium mt-0.5">{execKpis.period}</p>
          </div>

          {isLeadership && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/ingest"
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Ingest Data</span>
              </Link>
              <button
                onClick={handleExportPdf}
                className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className={`w-3.5 h-3.5 ${downloading ? "animate-bounce" : ""}`} />
                <span>Export PDF Briefing</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Exec KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-900/40 border border-purple-400/20 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200">Total Outages</span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">{execKpis.totalOutages}</div>
            <span className="text-[10px] text-purple-200 mt-1 block">{execKpis.volumeChange}</span>
          </div>

          <div className="bg-purple-900/40 border border-purple-400/20 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200">Avg Resolution</span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">{execKpis.avgResolution}</div>
            <span className="text-[10px] text-purple-200 mt-1 block">Within 4h SLA</span>
          </div>

          <div className="bg-purple-900/40 border border-purple-400/20 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200">Revenue at Risk</span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">{execKpis.revenueAtRisk}</div>
            <span className="text-[10px] text-purple-200 mt-1 block">Week total</span>
          </div>

          <div className="bg-purple-900/40 border border-purple-400/20 rounded-xl p-3.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200">SLA Compliance</span>
            <div className="text-2xl font-black text-white mt-0.5 font-mono">{execKpis.slaCompliance}</div>
            <span className="text-[10px] text-purple-200 mt-1 block">Target: 90%</span>
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
                  <span className="font-mono font-bold text-purple-300 w-5">#{idx + 1}</span>
                  <span className="font-mono font-bold text-white">{outage.id}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-purple-200 font-semibold">{outage.region}</span>
                  <span className="font-mono font-black text-white w-10 text-right">{outage.impactScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
