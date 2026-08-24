"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  RefreshCw,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Briefcase,
  ExternalLink,
  Lock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Header({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshSpin, setRefreshSpin] = useState(false);

  const handleRefreshClick = () => {
    setRefreshSpin(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setRefreshSpin(false), 800);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="dashboard-topbar flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 mb-6 select-none">
      {/* Page Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
            {title}
          </h2>
          {user && (
            <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${user.roleBadgeColor} hidden sm:inline-block`}>
              {user.role}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {/* Date Filter Pill */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-xs text-xs font-semibold text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-purple-600" />
          <span>Jul 23, 2026</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 font-normal">Last 24h</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshSpin || isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>

        {/* Authenticated User Profile Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-white hover:bg-gray-50 border border-gray-200 pl-2 pr-3 py-1.5 rounded-xl shadow-xs text-xs font-semibold text-gray-800 transition-all cursor-pointer"
            >
              <div className={`w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs ${
                user.roleType === "noc_engineer" ? "bg-purple-600" :
                user.roleType === "regional_ops" ? "bg-blue-600" :
                user.roleType === "cx_lead" ? "bg-emerald-600" :
                "bg-amber-600"
              }`}>
                {user.initials}
              </div>
              <div className="text-left hidden xs:block">
                <div className="font-bold text-xs text-gray-900 leading-none">{user.name}</div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{user.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* User Account Header */}
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 mb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shadow-md ${
                        user.roleType === "noc_engineer" ? "bg-purple-600" :
                        user.roleType === "regional_ops" ? "bg-blue-600" :
                        user.roleType === "cx_lead" ? "bg-emerald-600" :
                        "bg-amber-600"
                      }`}>
                        {user.initials}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{user.name}</div>
                        <div className="text-[11px] font-mono text-purple-700 font-semibold">
                          ID: {user.userId}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${user.roleBadgeColor}`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-gray-200/60 text-[11px] text-gray-600">
                    <p className="font-semibold text-gray-800 flex items-center gap-1 mb-0.5">
                      <Briefcase className="w-3 h-3 text-gray-500" />
                      <span>{user.jobTitle}</span>
                    </p>
                    <p className="text-gray-500 text-[10.5px] leading-relaxed">
                      {user.department}
                    </p>
                  </div>
                </div>

                {/* Role Mission Summary */}
                <div className="px-3 py-2 text-[11px] text-gray-600 bg-purple-50/60 rounded-xl border border-purple-100 mb-2 leading-relaxed">
                  <div className="font-bold text-purple-900 text-[10px] uppercase font-mono tracking-wider mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-600" />
                    <span>Operational Mission &amp; Scope</span>
                  </div>
                  <p>{user.jobSummary}</p>
                </div>

                {/* Primary Route Link */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push(user.primaryRoute);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors mb-1 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                    <span>My Dashboard ({user.primaryRouteName})</span>
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{user.primaryRoute}</span>
                </button>

                {/* Logout Button */}
                <div className="pt-1.5 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Switch Account</span>
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">Exit Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}
