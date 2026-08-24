"use client";

import React, { useState } from "react";

export default function ImpactCalculator() {
  // Slider states
  const [reach, setReach] = useState<number>(75); // 0-100 % of max regional base
  const [complaintVelocity, setComplaintVelocity] = useState<number>(80); // 0-100 % of max complaint velocity
  const [revenueTier, setRevenueTier] = useState<number>(90); // 0-100 Tier weight
  const [durationSeverity, setDurationSeverity] = useState<number>(65); // 0-100 Duration escalation

  // Config-driven weights (FR7 / NFR Extensibility)
  const [weights, setWeights] = useState<{ reach: number; complaints: number; revenue: number; duration: number }>({
    reach: 0.35,
    complaints: 0.30,
    revenue: 0.20,
    duration: 0.15
  });
  const [activeWeightPreset, setActiveWeightPreset] = useState<string>("BALANCED");

  // Composite calculation
  const reachComponent = reach * weights.reach;
  const complaintComponent = complaintVelocity * weights.complaints;
  const revenueComponent = revenueTier * weights.revenue;
  const durationComponent = durationSeverity * weights.duration;

  const totalScore = Math.round(
    reachComponent + complaintComponent + revenueComponent + durationComponent
  );

  // Priority Tier mapping (FR7)
  const getPriorityTier = (score: number) => {
    if (score >= 75) return { label: "CRITICAL TIER", bg: "bg-rose-500/20 text-rose-400 border-rose-500/40", text: "text-rose-400", hex: "#f43f5e" };
    if (score >= 50) return { label: "HIGH TIER", bg: "bg-amber-500/20 text-amber-400 border-amber-500/40", text: "text-amber-400", hex: "#fbbf24" };
    if (score >= 25) return { label: "MEDIUM TIER", bg: "bg-blue-500/20 text-blue-400 border-blue-500/40", text: "text-blue-400", hex: "#60a5fa" };
    return { label: "LOW TIER", bg: "bg-gray-500/20 text-gray-400 border-gray-500/40", text: "text-gray-400", hex: "#9ca3af" };
  };

  const tier = getPriorityTier(totalScore);

  // Scenario Presets
  const applyPreset = (type: "fiber" | "rural" | "spike") => {
    if (type === "fiber") {
      setReach(92);
      setComplaintVelocity(85);
      setRevenueTier(95);
      setDurationSeverity(80);
    } else if (type === "rural") {
      setReach(15);
      setComplaintVelocity(10);
      setRevenueTier(25);
      setDurationSeverity(30);
    } else if (type === "spike") {
      setReach(45);
      setComplaintVelocity(98);
      setRevenueTier(60);
      setDurationSeverity(50);
    }
  };

  // Weight Presets (Phase 4 / NFR Extensibility)
  const applyWeightPreset = (preset: "BALANCED" | "CUSTOMER" | "REVENUE" | "SEVERITY") => {
    setActiveWeightPreset(preset);
    if (preset === "BALANCED") {
      setWeights({ reach: 0.35, complaints: 0.30, revenue: 0.20, duration: 0.15 });
    } else if (preset === "CUSTOMER") {
      setWeights({ reach: 0.40, complaints: 0.40, revenue: 0.10, duration: 0.10 });
    } else if (preset === "REVENUE") {
      setWeights({ reach: 0.20, complaints: 0.15, revenue: 0.50, duration: 0.15 });
    } else if (preset === "SEVERITY") {
      setWeights({ reach: 0.25, complaints: 0.25, revenue: 0.15, duration: 0.35 });
    }
  };

  return (
    <section id="calculator" className="py-20 relative bg-gray-950/80 border-y border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold">
            VECTORIZED 4-FACTOR COMPOSITE SCORING
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interactive Impact Scoring Simulator
          </h2>
          <p className="text-gray-400 text-base">
            Test how OutageIQ normalizes sub-scores and computes transparent composite priorities. Adjust sliders below to simulate live telecom outage conditions.
          </p>

          {/* Scenario Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-gray-400 font-semibold mr-1">Load Real-World Scenario:</span>
            <button
              onClick={() => applyPreset("fiber")}
              className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
            >
              🚨 Metro Fiber Cut
            </button>
            <button
              onClick={() => applyPreset("spike")}
              className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            >
              ⚡ Social Complaint Spike
            </button>
            <button
              onClick={() => applyPreset("rural")}
              className="px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
            >
              📻 Rural Tower Maintenance
            </button>
          </div>

          {/* Weight Tuning Presets (Phase 4) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-gray-800/80 max-w-2xl mx-auto">
            <span className="text-xs font-mono text-purple-400 font-semibold mr-1">Configurable Weights (FR7):</span>
            <button
              onClick={() => applyWeightPreset("BALANCED")}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                activeWeightPreset === "BALANCED"
                  ? "bg-purple-600 text-white font-bold"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              Balanced (35/30/20/15)
            </button>
            <button
              onClick={() => applyWeightPreset("CUSTOMER")}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                activeWeightPreset === "CUSTOMER"
                  ? "bg-purple-600 text-white font-bold"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              Customer-Centric (40/40/10/10)
            </button>
            <button
              onClick={() => applyWeightPreset("REVENUE")}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                activeWeightPreset === "REVENUE"
                  ? "bg-purple-600 text-white font-bold"
                  : "bg-gray-900 text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              Revenue-Focused (20/15/50/15)
            </button>
          </div>
        </div>

        {/* Calculator Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Sliders */}
          <div className="lg:col-span-7 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                4-Factor Normalized Input Sub-Scores
              </h3>
              <span className="text-xs font-mono text-gray-400">Min-Max Scale (0–100)</span>
            </div>

            {/* Slider 1: Reach */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <label className="font-semibold text-gray-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  1. Customer Reach Sub-Score
                </label>
                <div className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {reach} / 100 <span className="text-gray-400 font-normal text-[11px]">({Math.round(weights.reach * 100)}% Wt)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reach}
                onChange={(e) => setReach(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-[11px] text-gray-400">
                Subscribers affected in region ÷ Total subscriber base (Normalized Reach)
              </p>
            </div>

            {/* Slider 2: Complaints */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <label className="font-semibold text-gray-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  2. Complaint Pressure Sub-Score
                </label>
                <div className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {complaintVelocity} / 100 <span className="text-gray-400 font-normal text-[11px]">({Math.round(weights.complaints * 100)}% Wt)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={complaintVelocity}
                onChange={(e) => setComplaintVelocity(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-gray-400">
                Complaint count + Velocity spike per hour during active window (Normalized Complaints)
              </p>
            </div>

            {/* Slider 3: Revenue */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <label className="font-semibold text-gray-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  3. Revenue Exposure Sub-Score
                </label>
                <div className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {revenueTier} / 100 <span className="text-gray-400 font-normal text-[11px]">({Math.round(weights.revenue * 100)}% Wt)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={revenueTier}
                onChange={(e) => setRevenueTier(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-[11px] text-gray-400">
                Region revenue tier × Est. outage duration (Normalized Revenue Exposure)
              </p>
            </div>

            {/* Slider 4: Duration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <label className="font-semibold text-gray-200 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  4. Duration & Severity Escalation
                </label>
                <div className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {durationSeverity} / 100 <span className="text-gray-400 font-normal text-[11px]">({Math.round(weights.duration * 100)}% Wt)</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={durationSeverity}
                onChange={(e) => setDurationSeverity(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <p className="text-[11px] text-gray-400">
                Severity code × time open (unresolved outages escalate over time)
              </p>
            </div>

          </div>

          {/* Right Column: Score Gauge & Breakdown */}
          <div className="lg:col-span-5 bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Calculated Impact Score
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${tier.bg}`}>
                  {tier.label}
                </span>
              </div>

              {/* Gauge Display */}
              <div className="relative py-6 flex flex-col items-center justify-center">
                <div className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tight" style={{ color: tier.hex }}>
                  {totalScore}
                  <span className="text-xl text-gray-500 font-normal"> / 100</span>
                </div>

                <div className="w-full bg-gray-800 h-3 rounded-full mt-6 overflow-hidden flex">
                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${reachComponent}%` }} title="Reach Component" />
                  <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${complaintComponent}%` }} title="Complaints Component" />
                  <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${revenueComponent}%` }} title="Revenue Component" />
                  <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${durationComponent}%` }} title="Duration Component" />
                </div>
              </div>

              {/* Formula Breakdown Table */}
              <div className="mt-6 space-y-2.5 text-xs font-mono">
                <div className="text-gray-400 font-sans font-semibold mb-2 text-[11px] uppercase tracking-wider">
                  Sub-Score Weighted Contribution Breakdown
                </div>

                <div className="flex justify-between p-2 rounded bg-gray-950/60 border border-gray-800">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Reach (35%):
                  </span>
                  <span className="text-blue-400 font-bold">+{reachComponent.toFixed(1)} pts</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-gray-950/60 border border-gray-800">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Complaints (30%):
                  </span>
                  <span className="text-amber-400 font-bold">+{complaintComponent.toFixed(1)} pts</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-gray-950/60 border border-gray-800">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Revenue (20%):
                  </span>
                  <span className="text-purple-400 font-bold">+{revenueComponent.toFixed(1)} pts</span>
                </div>

                <div className="flex justify-between p-2 rounded bg-gray-950/60 border border-gray-800">
                  <span className="text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Duration (15%):
                  </span>
                  <span className="text-rose-400 font-bold">+{durationComponent.toFixed(1)} pts</span>
                </div>
              </div>
            </div>

            {/* Explainability note */}
            <div className="mt-6 pt-4 border-t border-gray-800 text-[11px] text-gray-400 flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Zero Black Box:</strong> Every OutageIQ rank is 100% explainable via these visible sub-scores, allowing engineers & management to justify triage sequence.
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
