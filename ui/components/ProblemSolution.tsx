"use client";

import React from "react";

export default function ProblemSolution() {
  return (
    <section className="py-20 bg-gray-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold">
            PRD SECTION 1 & 2 ANALYSIS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Siloed Triage Trap vs. OutageIQ Paradigm
          </h2>
          <p className="text-gray-400 text-base">
            Why traditional telecom NOC workflows break down when network alerts are isolated from subscriber numbers and complaint spikes.
          </p>
        </div>

        {/* 2-Column Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Traditional Legacy Triage */}
          <div className="rounded-2xl bg-gradient-to-b from-rose-950/20 to-gray-900/60 border border-rose-900/30 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-rose-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Legacy Telecom Triage</h3>
                    <p className="text-xs text-rose-400 font-mono">Gut Feel & Raw Severity Codes</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full">
                  Status Quo
                </span>
              </div>

              <ul className="mt-6 space-y-4 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 text-lg font-bold shrink-0">✕</span>
                  <div>
                    <strong className="text-white">Data Streams in Silos:</strong> Network alerts (NOC), call center logs (CRM), and revenue tiers live in disconnected databases.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 text-lg font-bold shrink-0">✕</span>
                  <div>
                    <strong className="text-white">High-Impact Outages Deprioritized:</strong> A P2 outage affecting 50,000 enterprise users sits behind a P1 outage affecting only 20 rural subscribers.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 text-lg font-bold shrink-0">✕</span>
                  <div>
                    <strong className="text-white">Preventable SLA Breaches:</strong> NOC engineers lack visibility into complaint velocity, missing critical escalation windows.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 text-lg font-bold shrink-0">✕</span>
                  <div>
                    <strong className="text-white">No Executive View:</strong> Leadership has no aggregated metric to answer "what is currently on fire and what is the dollar impact?"
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-rose-900/30 text-xs text-rose-400/80 font-mono">
              Impact: Increased subscriber churn & millions lost in SLA penalties.
            </div>
          </div>

          {/* Card 2: OutageIQ Solution */}
          <div className="rounded-2xl bg-gradient-to-b from-blue-950/30 to-gray-900/90 border border-blue-500/40 p-6 sm:p-8 space-y-6 flex flex-col justify-between glow-blue">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">OutageIQ Solution</h3>
                    <p className="text-xs text-blue-400 font-mono">Unified 3-Stream Impact Engine</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  PRD Solution
                </span>
              </div>

              <ul className="mt-6 space-y-4 text-sm text-gray-200">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 text-lg font-bold shrink-0">✓</span>
                  <div>
                    <strong className="text-white">Unified Data Fusion:</strong> Merges outage alerts, complaint logs, and region ARPU via <code className="text-blue-300 font-mono text-xs">region_id</code> and spatio-temporal matching.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 text-lg font-bold shrink-0">✓</span>
                  <div>
                    <strong className="text-white">Dynamic 0–100 Impact Score:</strong> Weighted score (35% Reach, 30% Complaints, 20% Revenue, 15% Duration) re-ranks automatically as new signals arrive.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 text-lg font-bold shrink-0">✓</span>
                  <div>
                    <strong className="text-white">30% Faster Time-to-Triage:</strong> NOC engineers instantly view the top-impact outages on a single, clean queue.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 text-lg font-bold shrink-0">✓</span>
                  <div>
                    <strong className="text-white">Explainable & Presentation-Ready:</strong> Sub-score breakdown for engineers + 1-click executive view for directors.
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-blue-500/30 text-xs text-emerald-400 font-mono">
              Outcome: 90%+ critical outages resolved within SLA window.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
