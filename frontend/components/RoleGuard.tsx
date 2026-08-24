"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Lock, ArrowLeft, LogOut, Sparkles, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  children: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, isRouteAuthorized, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login");
      }
      setHasChecked(true);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Loading state while checking localStorage session
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen bg-[#0B0819] flex flex-col items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-purple-600/30 animate-pulse">
            OQ
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            <span>Verifying OutageIQ Security Context &amp; Role Access...</span>
          </div>
        </div>
      </div>
    );
  }

  // If on login page, render normally
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // If not authenticated, the router will redirect to /login
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0B0819] flex flex-col items-center justify-center text-white select-none">
        <div className="text-center space-y-3">
          <Lock className="w-8 h-8 text-purple-400 mx-auto animate-bounce" />
          <p className="text-sm font-medium text-gray-300">Redirecting to OutageIQ Secure Sign-In...</p>
        </div>
      </div>
    );
  }

  // Check if current route is authorized for the logged-in user
  const isAllowed = isRouteAuthorized(pathname);

  if (!isAllowed) {
    // Find matching restriction info
    const matchedRestriction = user.restrictedRoutes.find((r) => {
      const cleanPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
      const cleanRoute = r.route.endsWith("/") && r.route.length > 1 ? r.route.slice(0, -1) : r.route;
      return cleanPath === cleanRoute || cleanPath.startsWith(cleanRoute + "/");
    });

    const targetTitle = matchedRestriction?.title || "Restricted System Module";
    const restrictionReason =
      matchedRestriction?.reason ||
      `This section is restricted based on separation of duties. Your assigned role (${user.role}) does not have permission to view or execute actions on this resource.`;
    const permittedRoles = matchedRestriction?.permittedRoles || ["Designated Authorized Personnel"];

    return (
      <div className="min-h-screen bg-[#0E0A1F] text-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-2xl w-full bg-[#16102E] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/40 relative overflow-hidden">
          {/* Top glowing ambient strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600" />

          {/* Warning Icon & Status */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/50">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5">
                <AlertTriangle className="w-3 h-3" />
                <span>403 Forbidden — Role Access Restricted</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Access Denied: {targetTitle}
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                Requested URL: <span className="text-rose-300 font-semibold">{pathname}</span>
              </p>
            </div>
          </div>

          {/* Detailed Role Context Box */}
          <div className="mt-6 bg-[#1D153D]/80 border border-[#2D225C] rounded-2xl p-4.5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2D225C]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
                  Logged In Identity
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {user.initials}
                  </div>
                  <span className="font-bold text-sm text-white">{user.name}</span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${user.roleBadgeColor}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">
                  Dummy User ID
                </span>
                <span className="text-xs font-mono font-semibold text-purple-300">
                  {user.userId}
                </span>
              </div>
            </div>

            {/* Why restricted */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block font-bold mb-1">
                Security Policy &amp; Separation of Duties
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">
                {restrictionReason}
              </p>
            </div>

            {/* Permitted Roles */}
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Authorized Personas:</span>
              <div className="flex flex-wrap gap-1.5">
                {permittedRoles.map((r) => (
                  <span key={r} className="px-2 py-0.5 rounded bg-[#271C50] text-purple-200 text-[11px] font-mono border border-purple-500/20">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#231A47]">
            <Link
              href={user.primaryRoute}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to Your Authorized Dashboard ({user.primaryRouteName})</span>
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#211745] hover:bg-rose-500/20 hover:border-rose-500/40 text-gray-300 hover:text-rose-200 border border-[#2F235F] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch User Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized: render the dashboard page
  return <>{children}</>;
}
