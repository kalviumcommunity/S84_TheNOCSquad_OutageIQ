"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { USER_ACCOUNTS, UserAccount } from "@/lib/auth";
import {
  Lock,
  User,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin, isAuthenticated, user: currentUser, logout } = useAuth();

  const [userIdInput, setUserIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [showCredentialsTable, setShowCredentialsTable] = useState(true);

  // If already authenticated and visiting /login, show a fast switch or redirect option
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userIdInput.trim()) {
      setErrorMessage("Please enter your Dummy User ID or username.");
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoadingUser("manual");
    const result = login(userIdInput, passwordInput);

    if (result.success && result.user) {
      router.push(result.user.primaryRoute);
    } else {
      setLoadingUser(null);
      setErrorMessage(result.error || "Invalid credentials. Please verify your Dummy User ID and password.");
    }
  };

  const handleQuickLogin = (acc: UserAccount) => {
    setErrorMessage(null);
    setLoadingUser(acc.id);
    const result = quickLogin(acc.id);
    if (result.success && result.user) {
      setTimeout(() => {
        router.push(result.user!.primaryRoute);
      }, 200);
    } else {
      setLoadingUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0718] text-gray-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white font-sans">
      {/* Background Glow Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-[#1E173D] bg-[#0E0A22]/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-purple-900/50">
            OQ
          </div>
          <div>
            <span className="text-lg font-extrabold text-white tracking-tight leading-none block">
              OutageIQ
            </span>
            <p className="text-[11px] text-gray-400 font-medium">
              Network Outage Impact Prioritization Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#161033] border border-[#2B1F54] px-3 py-1.5 rounded-full text-purple-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden sm:inline">Role-Based Access Control (RBAC) System</span>
          <span className="sm:hidden">RBAC Active</span>
        </div>
      </header>

      {/* Main Content Area */}
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

        {/* Main Grid: Left Manual Login + Right 4 One-Click Demo Profiles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Manual Login Form (5 cols) */}
          <div className="lg:col-span-5 bg-[#120D2A] border border-[#261C50] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-purple-400 uppercase tracking-wider mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Authentication Portal</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Sign In to OutageIQ
              </h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Enter your individual dummy user credentials to access your role-specific telecom operational dashboard.
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
                  Dummy User ID / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="e.g. rahul.noc, priya.ops, farah.cx, vikram.exec"
                    className="w-full bg-[#1A133A] border border-[#2E225E] text-white text-xs rounded-xl pl-9 pr-3.5 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono placeholder:text-gray-500"
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
                    placeholder="e.g. noc@123, ops@123, cx@123, exec@123"
                    className="w-full bg-[#1A133A] border border-[#2E225E] text-white text-xs rounded-xl pl-9 pr-3.5 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono placeholder:text-gray-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingUser !== null}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingUser === "manual" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Signing In...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-[#221848] text-center">
              <p className="text-[11px] text-gray-400">
                Or select any of the 4 operational roles on the right to log in with 1 click.
              </p>
            </div>
          </div>

          {/* Right Column: 4 One-Click Demo Role Profiles (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Select an Operational Role (1-Click Login)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Each persona receives a strictly isolated dashboard and custom layout based on their responsibilities:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {USER_ACCOUNTS.map((acc) => {
                const isSelected = currentUser?.id === acc.id;
                const isLoading = loadingUser === acc.id;

                let Icon = Zap;
                if (acc.roleType === "regional_ops") Icon = Globe;
                if (acc.roleType === "cx_lead") Icon = TrendingUp;
                if (acc.roleType === "leadership") Icon = Award;

                return (
                  <div
                    key={acc.id}
                    onClick={() => handleQuickLogin(acc)}
                    className={`bg-[#130E29] hover:bg-[#1C143C] border ${
                      isSelected ? "border-purple-500 bg-[#1D1442] ring-1 ring-purple-500/50 shadow-xl shadow-purple-950/50" : "border-[#271D52] hover:border-[#3C2E7A]"
                    } rounded-2xl p-4.5 transition-all flex flex-col justify-between group cursor-pointer text-left relative overflow-hidden`}
                  >
                    {/* Top Accent Pill */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md ${
                          acc.roleType === "noc_engineer" ? "bg-purple-600 text-white" :
                          acc.roleType === "regional_ops" ? "bg-blue-600 text-white" :
                          acc.roleType === "cx_lead" ? "bg-emerald-600 text-white" :
                          "bg-amber-600 text-white"
                        }`}>
                          {acc.initials}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                            <span>{acc.name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                          </h4>
                          <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${acc.roleBadgeColor}`}>
                            {acc.role}
                          </span>
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-white/5 text-gray-400 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Job Scope Description */}
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-3">
                      {acc.jobSummary}
                    </p>

                    {/* Footer with Dummy ID and Landing Route */}
                    <div className="pt-2.5 border-t border-[#231A47] flex items-center justify-between text-[10px] font-mono">
                      <div>
                        <span className="text-gray-500">ID: </span>
                        <span className="text-purple-300 font-semibold">{acc.userId}</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        <span>{isLoading ? "Signing in..." : `Open ${acc.primaryRouteName}`}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Documentation & Dummy Credentials Reference */}
        <div className="mt-10 bg-[#120D2A] border border-[#271C50] rounded-3xl p-5 sm:p-6 shadow-xl">
          <button
            type="button"
            onClick={() => setShowCredentialsTable(!showCredentialsTable)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Dummy User Credentials &amp; Access Permission Matrix (Reference from USER-ROLE.MD)
              </span>
            </div>
            {showCredentialsTable ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showCredentialsTable && (
            <div className="mt-4 pt-4 border-t border-[#221848] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#241A4C] text-[10px] font-mono text-gray-400 uppercase">
                    <th className="pb-2.5 font-semibold">User / Profile</th>
                    <th className="pb-2.5 font-semibold">Dummy User ID</th>
                    <th className="pb-2.5 font-semibold">Password</th>
                    <th className="pb-2.5 font-semibold">Primary Dashboard</th>
                    <th className="pb-2.5 font-semibold">Allowed Pages</th>
                    <th className="pb-2.5 font-semibold">Restricted Pages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1640] text-gray-300">
                  {USER_ACCOUNTS.map((acc) => (
                    <tr key={acc.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${acc.roleBadgeColor}`}>
                            {acc.initials}
                          </span>
                          <span>{acc.name} ({acc.role})</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-purple-300 font-bold">
                        {acc.userId}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-gray-400">
                        {acc.password}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-emerald-400">
                        {acc.primaryRoute}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-gray-300">
                        {acc.allowedRoutes.filter(r => r !== "/").join(", ")}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-rose-300">
                        {acc.restrictedRoutes.map(r => r.route).join(", ") || "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1E173D] bg-[#0A071A] px-4 py-4 text-center text-xs text-gray-500 font-mono">
        <span>OutageIQ Telecom Operations Platform • Role-Based Access Control Active</span>
      </footer>
    </div>
  );
}
