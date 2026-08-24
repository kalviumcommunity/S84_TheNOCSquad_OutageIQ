"use client";

import React from "react";
import Link from "next/link";

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
              Telecom Operations Suite
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Platform Navigation
            </h4>
            <ul className="space-y-2">
              <li><Link href="/overview" className="hover:text-white transition-colors">Overview Dashboard</Link></li>
              <li><Link href="/queue" className="hover:text-white transition-colors">Outage Queue</Link></li>
              <li><Link href="/regions" className="hover:text-white transition-colors">Region View</Link></li>
              <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              <li><Link href="/export" className="hover:text-white transition-colors">Exportable Data</Link></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Architecture & Stack
            </h4>
            <ul className="space-y-1.5 font-mono text-xs text-gray-400">
              <li>• Python, Pandas, NumPy</li>
              <li>• Vectorized Scoring Pipeline</li>
              <li>• Next.js & React Dashboard</li>
              <li>• Real-Time Geo-Analytics</li>
              <li>• Automated CSV & PDF Export</li>
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
            © 2026 OutageIQ — The NOC Squad. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Enterprise NOC Solution</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">SLA Tracking & Governance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
