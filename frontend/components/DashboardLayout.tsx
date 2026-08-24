"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RoleGuard from "./RoleGuard";
import { Menu, X, Shield, Activity, Globe, MessageSquare, TrendingUp, Sparkles } from "lucide-react";
import { useFilter } from "@/context/FilterContext";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  activeRoute?: string;
  onRefreshData?: () => void;
}

export default function DashboardLayout({
  title,
  subtitle,
  children,
  onRefreshData
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const filterContext = useFilter();
  const { user } = useAuth();

  const refreshOutages = filterContext.refreshOutages;

  const handleRefresh = async () => {
    if (onRefreshData) onRefreshData();
    if (refreshOutages) await refreshOutages();
  };

  return (
    <RoleGuard>
      <div className="min-h-screen bg-[#F8F9FD] text-gray-900 flex font-sans antialiased selection:bg-purple-600 selection:text-white">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-50 max-md:flex backdrop-blur-xs hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-[#130E26] h-full shadow-2xl animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 flex items-center justify-between border-b border-[#241A48]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-extrabold flex items-center justify-center">
                    OQ
                  </div>
                  <span className="font-bold text-white text-sm">OutageIQ</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Right Content Panel */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
          {/* Mobile Header Bar */}
          <div className="max-md:flex hidden items-center justify-between p-4 bg-[#130E26] text-white border-b border-[#241A48] sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-lg bg-[#1F173D] text-gray-300 hover:text-white cursor-pointer"
                aria-label="Toggle Dashboard Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="font-bold text-sm">OutageIQ NOC</div>
            </div>
            {user && (
              <div className={`w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center ${
                user.roleType === "noc_engineer" ? "bg-purple-600" :
                user.roleType === "regional_ops" ? "bg-blue-600" :
                user.roleType === "cx_lead" ? "bg-emerald-600" :
                "bg-amber-600"
              }`}>
                {user.initials}
              </div>
            )}
          </div>

          {/* User Role Banner Strip */}
          {user && (
            <div className={`px-4 sm:px-8 py-2.5 border-b text-xs flex items-center justify-between flex-wrap gap-2 ${
              user.roleType === "noc_engineer" ? "bg-purple-950/90 text-purple-200 border-purple-900/50" :
              user.roleType === "regional_ops" ? "bg-blue-950/90 text-blue-200 border-blue-900/50" :
              user.roleType === "cx_lead" ? "bg-emerald-950/90 text-emerald-200 border-emerald-900/50" :
              "bg-amber-950/90 text-amber-200 border-amber-900/50"
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold uppercase tracking-wider font-mono text-[10px]">
                  {user.role} Dashboard
                </span>
                <span className="opacity-40">|</span>
                <span className="text-[11px] font-medium truncate max-w-xl">
                  {user.jobSummary}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="opacity-75">Logged In: <strong>{user.name}</strong> ({user.userId})</span>
                <span className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-[10px]">
                  {user.primaryRouteName} View
                </span>
              </div>
            </div>
          )}

          {/* Inner Content with Header and Pages */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            <Header
              title={title}
              subtitle={subtitle}
              onRefresh={handleRefresh}
            />
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
