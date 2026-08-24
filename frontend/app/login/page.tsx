"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  User,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  Award,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Layers,
  Activity,
  CheckCircle2,
  Cpu,
  Radio,
  BarChart3
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user: currentUser, logout } = useAuth();

  const [userIdInput, setUserIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userIdInput.trim()) {
      setErrorMessage("Please enter your user ID.");
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    const result = login(userIdInput, passwordInput);

    if (result.success && result.user) {
      router.push(result.user.primaryRoute);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || "Invalid user ID or password. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090616] text-gray-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white font-sans">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-[#1E163B] bg-[#0E0924]/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-purple-900/50">
            OQ
          </div>
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight leading-none block">
              OutageIQ
            </span>
            <p className="text-[11px] text-gray-400 font-medium">
              Network Operations &amp; Impact Prioritization Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#161033] border border-[#2B1F54] px-3.5 py-1.5 rounded-full text-purple-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden sm:inline">Telemetry &amp; Security Active</span>
          <span className="sm:hidden">Online</span>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {/* Active Session Notification if already logged in */}
        {isAuthenticated && currentUser && (
          <div className="mb-8 bg-[#181136] border border-purple-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.initials}
              </div>
              <div>
                <p className="text-xs text-purple-300 font-mono">Currently logged in as:</p>
                <p className="text-sm font-bold text-white">
                  {currentUser.name} — <span className="text-purple-300 font-normal">{currentUser.role}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push(currentUser.primaryRoute)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Dashboard ({currentUser.primaryRouteName})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                className="bg-[#241B4B] hover:bg-rose-500/20 text-gray-300 hover:text-rose-200 border border-[#34276A] text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Grid: Left Login Card + Right Big Project Overview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Clean Production Login Form (5 cols) */}
          <div className="lg:col-span-5 bg-[#120D2A] border border-[#261C50] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-purple-400 uppercase tracking-wider mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Secure Access Portal</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Sign In to OutageIQ
              </h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Enter your credentials to access your operational dashboard.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              {/* User ID Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  User ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="Enter your user ID"
                    className="w-full bg-[#1A133A] border border-[#2E225E] text-white text-xs rounded-xl pl-9 pr-3.5 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#1A133A] border border-[#2E225E] text-white text-xs rounded-xl pl-9 pr-3.5 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans placeholder:text-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#221848] text-center">
              <p className="text-[11px] text-gray-500">
                OutageIQ Telecom Operations • Role-Based Access Control
              </p>
            </div>
          </div>

          {/* Right Column: Single Big Card Explaining Project (7 cols) */}
          <div className="lg:col-span-7 bg-[#120D2A] border border-[#261C50] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-purple-400 uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Telecom Operational Intelligence</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                OutageIQ — Network Outage Impact Prioritization Engine
              </h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                A unified data product that eliminates operational silos by fusing real-time network alarms, high-velocity customer complaint streams, and regional subscriber metrics into an explainable, composite <strong>Impact Score (0–100)</strong>.
              </p>
            </div>

            {/* 3 Core Architecture Pillars */}
            <div className="space-y-3">
              {/* Pillar 1 */}
              <div className="bg-[#191238] border border-[#2B1F54] rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Multi-Source Signal Fusion
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Merges raw network infrastructure alarms (core fiber, edge switches), customer complaint logs across call centers and apps, and regional subscriber usage densities.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-[#191238] border border-[#2B1F54] rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Explainable Composite Impact Scoring (0–100)
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Dynamically computes ranking via four weighted sub-scores: <strong>Customer Reach (35%)</strong>, <strong>Complaint Pressure (30%)</strong>, <strong>Revenue Exposure (20%)</strong>, and <strong>Duration &amp; Severity (15%)</strong>.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-[#191238] border border-[#2B1F54] rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Tailored Role-Based Workflows
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Provides purpose-built interfaces for <strong>NOC Engineers</strong> (live triage &amp; technician dispatch), <strong>Regional Ops Managers</strong> (circle SLA compliance), <strong>CX Leads</strong> (complaint velocity &amp; proactive alerts), and <strong>Leadership</strong> (revenue-at-risk &amp; executive PDF briefings).
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Highlights Strip */}
            <div className="pt-3 border-t border-[#231A47] flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400 font-mono">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>9 Geographic Circles Monitored</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Sub-Second Queue Prioritization</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Proactive SLA Breach Defense</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1E173D] bg-[#0A071A] px-4 py-4 text-center text-xs text-gray-500 font-mono">
        <span>OutageIQ Telecom Operations Platform • Role-Based Access Control Active</span>
      </footer>
    </div>
  );
}
