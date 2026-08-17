"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 py-16 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                ⚡
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">OutageIQ</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Network Outage Impact Prioritization Engine. Fusing network alerts, complaint velocity, and regional revenue into explainable triage.
            </p>
            <div className="text-[11px] font-mono text-gray-500">
              PRD Release Date: 27 July 2026
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              PRD Navigation
            </h4>
            <ul className="space-y-2">
              <li><a href="#calculator" className="hover:text-white transition-colors">Scoring Simulator (Sec 7)</a></li>
              <li><a href="#queue-preview" className="hover:text-white transition-colors">Live Queue Demo (Sec 8.3)</a></li>
              <li><a href="#personas" className="hover:text-white transition-colors">Target Personas (Sec 4)</a></li>
              <li><a href="#methodology" className="hover:text-white transition-colors">5-Step Pipeline (Sec 6)</a></li>
              <li><a href="#prd-spec" className="hover:text-white transition-colors">FR1–FR16 Specs (Sec 8)</a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Tech Stack Mapped (Sec 12)
            </h4>
            <ul className="space-y-1.5 font-mono text-xs text-gray-400">
              <li>• Python, Pandas, NumPy</li>
              <li>• SQL Window Functions</li>
              <li>• Streamlit / Next.js UI</li>
              <li>• Plotly Analytics</li>
              <li>• PDF & CSV Automated Export</li>
            </ul>
          </div>

          {/* Authors & Team */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Project Team
            </h4>
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
              <div className="text-xs font-bold text-white">The NOC Squad</div>
              <div className="text-xs text-gray-300">
                Owners: <span className="text-blue-400 font-semibold">Bhawana Kumari</span> & <span className="text-indigo-400 font-semibold">Karan Devgan</span>
              </div>
              <div className="text-[11px] text-gray-400">
                Kalvium Software Engineering
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © 2026 OutageIQ — The NOC Squad. All rights reserved. PRD v1.0 Release.
          </div>
          <div className="flex items-center gap-4">
            <a href="#prd-spec" className="hover:text-gray-300 transition-colors">Privacy & Data Quality</a>
            <a href="#prd-spec" className="hover:text-gray-300 transition-colors">SLA Guarantees</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
