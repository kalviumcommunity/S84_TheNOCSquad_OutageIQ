"use client";

import React from "react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background Radial Lights & Grids */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/40 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-rose-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* PRD Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>THE NOC SQUAD • PRD RELEASE SPECIFICATION</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Transform Telecom Outage Triage from{" "}
              <span className="bg-gradient-to-r from-red-400 via-amber-400 to-rose-400 bg-clip-text text-transparent underline decoration-red-500/30">
                Gut Feel
              </span>{" "}
              to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Quantified Impact
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl font-normal leading-relaxed">
              Telecom teams receive network alerts, customer complaint spikes, and regional revenue metrics in isolated silos. <strong className="text-white font-semibold">OutageIQ</strong> fuses these 3 streams into a real-time, explainable Impact Score <span className="font-mono text-blue-400 font-semibold">(0–100)</span> so NOC engineers always fix what matters most first.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#calculator"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Try Live Impact Calculator</span>
              </a>

              <a
                href="#queue-preview"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-900/90 border border-gray-800 text-gray-200 hover:text-white hover:bg-gray-800 font-semibold text-sm transition-all flex items-center justify-center gap-2 group"
              >
                <svg className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Explore Prioritized Queue</span>
              </a>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-800/80">
              <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/60 text-center lg:text-left">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">30% ↓</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Time-to-Triage</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/60 text-center lg:text-left">
                <div className="text-2xl font-extrabold text-blue-400 font-mono">90%+</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">SLA Compliance</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/60 text-center lg:text-left">
                <div className="text-2xl font-extrabold text-purple-400 font-mono">3 Streams</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Unified Fusion</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/60 text-center lg:text-left">
                <div className="text-2xl font-extrabold text-amber-400 font-mono">100%</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mt-0.5">Explainable AI</div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Interactive Fusion Diagram */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Glass Card Container */}
              <div className="relative rounded-2xl bg-gray-900/90 border border-gray-800 p-6 shadow-2xl backdrop-blur-xl glow-blue">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                      Live Signal Fusion Pipeline
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Engine Active
                  </span>
                </div>

                {/* 3 Siloed Streams -> Engine -> Prioritized Queue */}
                <div className="space-y-4">

                  {/* Input Stream 1: NOC Alerts */}
                  <div className="p-3 rounded-xl bg-gray-950/80 border border-blue-500/30 flex items-center justify-between hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        NOC
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Network Outage Alerts</div>
                        <div className="text-[10px] font-mono text-gray-400">Severity, Node ID, Service Type</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">15% Wt</span>
                  </div>

                  {/* Input Stream 2: Customer Complaints */}
                  <div className="p-3 rounded-xl bg-gray-950/80 border border-amber-500/30 flex items-center justify-between hover:border-amber-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        CRM
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Customer Complaints</div>
                        <div className="text-[10px] font-mono text-gray-400">Call Center Volume & Velocity</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">30% Wt</span>
                  </div>

                  {/* Input Stream 3: Usage & Revenue */}
                  <div className="p-3 rounded-xl bg-gray-950/80 border border-purple-500/30 flex items-center justify-between hover:border-purple-400 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        ERP
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Region Usage & ARPU</div>
                        <div className="text-[10px] font-mono text-gray-400">Subscriber Reach & Tier</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">35% Wt</span>
                  </div>

                  {/* Fusion Engine Node */}
                  <div className="relative py-2 my-1 text-center">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-dashed border-gray-700" />
                    </div>
                    <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-mono text-xs font-bold shadow-lg">
                      <svg className="w-4 h-4 animate-spin text-blue-200" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      OutageIQ Scoring Engine (FR5)
                    </div>
                  </div>

                  {/* Output Preview Ticket */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/80 to-gray-900 border border-rose-500/40 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                          CRITICAL #1
                        </span>
                        <span className="text-xs font-mono text-gray-300 font-semibold">OUT-8902 (North Region)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold font-mono text-rose-400">92.4 <span className="text-xs text-gray-400 font-normal">/100</span></div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-300">
                      12,400 Subscribers • 480 complaints/hr • $45k ARPU Exposure
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
