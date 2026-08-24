"use client";

import React, { useState } from "react";

interface Persona {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  icon: string;
  quote: string;
  needs: string[];
  keyFeatures: string[];
  mockData: {
    title: string;
    metrics: { label: string; value: string; color: string }[];
  };
}

const personas: Persona[] = [
  {
    id: "rahul",
    name: "Rahul",
    role: "NOC Engineer",
    avatarBg: "from-blue-600 to-cyan-600",
    icon: "🛠️",
    quote: "I need to know which active network alert will cause the biggest business impact if I don't assign a field technician right now.",
    needs: [
      "Ranked queue of active outages ordered strictly by composite Impact Score",
      "Quick filters by region, severity code, and priority tier",
      "Transparent sub-score breakdown so I know WHY an outage scored 94.2"
    ],
    keyFeatures: [
      "Prioritized Outage Queue",
      "Explainable Detail Inspector",
      "Emergency Alert Banners"
    ],
    mockData: {
      title: "Rahul's Active Triage Queue",
      metrics: [
        { label: "Top Priority Outage", value: "OUT-2026-0723-N91 (Score: 92.4)", color: "text-rose-400" },
        { label: "Active Queue Count", value: "24 Incidents Open", color: "text-blue-400" },
        { label: "Avg Time-to-Triage", value: "3h 42m MTTR (↓ 30%)", color: "text-emerald-400" }
      ]
    }
  },
  {
    id: "priya",
    name: "Priya",
    role: "Regional Ops Manager",
    avatarBg: "from-purple-600 to-indigo-600",
    icon: "🗺️",
    quote: "I manage regional operations. I need real-time alerts when complaint velocity in my territory crosses critical SLA thresholds.",
    needs: [
      "Region-filtered impact view showing active tower nodes & affected subscribers",
      "SLA escalation tracking before contract breach penalties hit",
      "Complaint spike detection correlated with region revenue tiers"
    ],
    keyFeatures: [
      "Region Impact Heatmap & Ranking",
      "SLA Breach Escalation Warnings",
      "Multi-Circle Comparison Matrix"
    ],
    mockData: {
      title: "Priya's Mumbai Circle Operational Status",
      metrics: [
        { label: "Mumbai Active Subscribers", value: "4.2M Total", color: "text-purple-400" },
        { label: "Active Regional Outages", value: "4 Incidents (Critical P1)", color: "text-amber-400" },
        { label: "SLA Risk Margin", value: "38 Mins Remaining", color: "text-rose-400" }
      ]
    }
  },
  {
    id: "farah",
    name: "Farah",
    role: "Customer Experience Lead",
    avatarBg: "from-amber-600 to-orange-600",
    icon: "💬",
    quote: "When customers tweet or call about data drops, I need to know which specific outage caused it so we can trigger proactive comms.",
    needs: [
      "Direct correlation between call center complaint logs & network outage IDs",
      "Spatio-temporal matching for unlinked complaint records",
      "Proactive customer sentiment impact tracking during resolution"
    ],
    keyFeatures: [
      "Complaint Pressure Component (30% Wt)",
      "Unlinked Complaint Matcher",
      "Proactive Customer Comms Tracking"
    ],
    mockData: {
      title: "Farah's CX & Complaint Pressure Panel",
      metrics: [
        { label: "Linked Complaints", value: "1,842 Logged Today", color: "text-amber-400" },
        { label: "Complaint Velocity Spike", value: "+342 / hr Peak", color: "text-rose-400" },
        { label: "Matched Outage Confidence", value: "96% Spatio-Temporal", color: "text-emerald-400" }
      ]
    }
  },
  {
    id: "vikram",
    name: "Vikram",
    role: "Leadership / Director",
    avatarBg: "from-emerald-600 to-teal-600",
    icon: "📈",
    quote: "I want a presentation-ready executive view showing top 5 outages by impact, revenue at risk, and weekly trends for upper management.",
    needs: [
      "1-click presentation-ready Executive View (KPI summary + Top 5 outages)",
      "Revenue exposure tracking across region tiers",
      "Exportable executive PDF / CSV report generation"
    ],
    keyFeatures: [
      "Top 5 Executive View Toggle",
      "Automated PDF/CSV Reports",
      "Rolling Trend Analytics"
    ],
    mockData: {
      title: "Vikram's Weekly Executive Summary",
      metrics: [
        { label: "Top 5 Impact Total", value: "₹42.3 Cr Exposure", color: "text-emerald-400" },
        { label: "SLA Resolution Rate", value: "84.0% (Target >= 90%)", color: "text-blue-400" },
        { label: "Weekly Trend", value: "↓ 18% Total Outage Hours", color: "text-indigo-400" }
      ]
    }
  }
];

export default function PersonasSection() {
  const [activeTab, setActiveTab] = useState<string>("rahul");
  const selectedPersona = personas.find((p) => p.id === activeTab) || personas[0];

  return (
    <section id="personas" className="py-20 bg-gray-950/90 border-t border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-semibold">
            OPERATIONAL STAKEHOLDER PERSONAS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tailored for the Entire Telecom Operations Stack
          </h2>
          <p className="text-gray-400 text-base">
            From field engineers triaging live alerts to directors reporting weekly revenue exposure, OutageIQ serves every operational persona.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col items-start justify-between ${
                activeTab === p.id
                  ? "bg-gray-900 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50"
                  : "bg-gray-900/40 border-gray-800/80 hover:bg-gray-900/80 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <div className="text-sm font-bold text-white">{p.name}</div>
                  <div className="text-[11px] text-gray-400">{p.role}</div>
                </div>
              </div>
              <div className={`mt-3 text-[10px] font-mono px-2 py-0.5 rounded ${
                activeTab === p.id ? "bg-blue-500/20 text-blue-300" : "bg-gray-800 text-gray-400"
              }`}>
                View Tailored Experience →
              </div>
            </button>
          ))}
        </div>

        {/* Selected Persona Detail Box */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Persona Info & Needs */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedPersona.avatarBg} flex items-center justify-center text-3xl shadow-lg`}>
                {selectedPersona.icon}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">{selectedPersona.name}</h3>
                <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
                  {selectedPersona.role}
                </span>
              </div>
            </div>

            {/* Quote */}
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 italic text-sm text-gray-300">
              &ldquo;{selectedPersona.quote}&rdquo;
            </div>

            {/* User Needs */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                Core Operational Needs
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                {selectedPersona.needs.map((need, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{need}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Features Mapped */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800">
              <span className="text-xs text-gray-400 font-semibold">Platform Capabilities:</span>
              {selectedPersona.keyFeatures.map((feat, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono">
                  {feat}
                </span>
              ))}
            </div>

          </div>

          {/* Persona Live Dashboard Mockup */}
          <div className="lg:col-span-5 bg-gray-950 rounded-xl p-5 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-mono font-bold text-gray-300">
                {selectedPersona.mockData.title}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              {selectedPersona.mockData.metrics.map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-gray-900/80 border border-gray-800/80 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">{m.label}</span>
                  <span className={`text-xs font-bold font-mono ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
                <span>Integrated into Operations Suite</span>
                <span>✓</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
