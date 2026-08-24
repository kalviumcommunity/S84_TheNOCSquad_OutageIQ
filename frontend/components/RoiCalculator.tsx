"use client";

import React, { useState } from "react";

export default function RoiCalculator() {
  const [annualOutages, setAnnualOutages] = useState<number>(120);
  const [avgSlaPenalty, setAvgSlaPenalty] = useState<number>(8500); // $8,500 per breach
  const [breachRate, setBreachRate] = useState<number>(25); // 25% breach rate baseline

  // Calculations
  const currentBreaches = Math.round((annualOutages * breachRate) / 100);
  const currentSlaCost = currentBreaches * avgSlaPenalty;

  // OutageIQ reduces breaches to <= 10% (Target >= 90% SLA compliance)
  const newBreachRate = 8; // 8% breach rate
  const newBreaches = Math.round((annualOutages * newBreachRate) / 100);
  const newSlaCost = newBreaches * avgSlaPenalty;

  const annualSavings = currentSlaCost - newSlaCost;
  const hoursSavedPerYear = Math.round(annualOutages * 1.8); // 1.8 hours saved per outage triage

  return (
    <section id="roi" className="py-20 bg-gray-950/90 border-t border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
            BUSINESS VALUE & ROI ESTIMATOR
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Calculate Your Telecom ROI & Savings
          </h2>
          <p className="text-gray-400 text-base">
            See how cutting time-to-triage by 30% and achieving ≥90% SLA compliance directly prevents contract penalties and churn.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 grid lg:grid-cols-12 gap-8 items-center shadow-2xl">
          
          {/* Sliders */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Slider 1: Annual Outages */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs sm:text-sm font-semibold text-gray-200">
                  Annual Outage Volume (P1–P3 events):
                </label>
                <span className="font-mono font-bold text-blue-400 text-sm bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                  {annualOutages} Outages / yr
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                value={annualOutages}
                onChange={(e) => setAnnualOutages(Number(e.target.value))}
                onInput={(e) => setAnnualOutages(Number((e.target as HTMLInputElement).value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Slider 2: Average SLA Penalty */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs sm:text-sm font-semibold text-gray-200">
                  Average SLA Breach Penalty ($ / event):
                </label>
                <span className="font-mono font-bold text-amber-400 text-sm bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  ${avgSlaPenalty.toLocaleString()} / breach
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={avgSlaPenalty}
                onChange={(e) => setAvgSlaPenalty(Number(e.target.value))}
                onInput={(e) => setAvgSlaPenalty(Number((e.target as HTMLInputElement).value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Slider 3: Current Breach Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs sm:text-sm font-semibold text-gray-200">
                  Baseline SLA Breach Rate (% of total outages):
                </label>
                <span className="font-mono font-bold text-rose-400 text-sm bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                  {breachRate}% Breach Rate
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={breachRate}
                onChange={(e) => setBreachRate(Number(e.target.value))}
                onInput={(e) => setBreachRate(Number((e.target as HTMLInputElement).value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950/60 via-gray-950 to-blue-950/60 border border-emerald-500/30 rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Estimated OutageIQ Impact
              </span>
              <div className="mt-3">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                  ${annualSavings.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-1">Estimated Annual SLA Penalty Savings</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div>
                <div className="text-xl font-bold font-mono text-blue-400">{hoursSavedPerYear} hrs</div>
                <div className="text-[11px] text-gray-400">NOC Engineering Time Saved</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-purple-400">92%</div>
                <div className="text-[11px] text-gray-400">Target SLA Compliance Achieved</div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400">
              * Based on 30% reduction in time-to-triage and Target SLA compliance ≥ 90%.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
