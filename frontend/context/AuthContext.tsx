"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { UserAccount, USER_ACCOUNTS, findUserByCredentials, getUserById, isPathAllowedForUser } from "@/lib/auth";

export interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userIdOrEmail: string, passwordAttempt: string) => { success: boolean; error?: string; user?: UserAccount };
  quickLogin: (userIdOrRole: string) => { success: boolean; user?: UserAccount };
  logout: () => void;
  isRouteAuthorized: (pathname: string) => boolean;
  isNocEngineer: boolean;
  isRegionalOps: boolean;
  isCxLead: boolean;
  isLeadership: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "outageiq_auth_user_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUserId) {
          const matchedUser = getUserById(storedUserId);
          if (matchedUser) {
            setUser(matchedUser);
          }
        }
      }
    } catch (_) {
      // Ignore storage read errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((userIdOrEmail: string, passwordAttempt: string) => {
    const matchedUser = findUserByCredentials(userIdOrEmail, passwordAttempt);
    if (matchedUser) {
      setUser(matchedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, matchedUser.id);
      } catch (_) {}
      return { success: true, user: matchedUser };
    } else {
      return { success: false, error: "Invalid credentials. Please verify your Dummy User ID and password." };
    }
  }, []);

  const quickLogin = useCallback((userIdOrRole: string) => {
    const matchedUser = getUserById(userIdOrRole);
    if (matchedUser) {
      setUser(matchedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, matchedUser.id);
      } catch (_) {}
      return { success: true, user: matchedUser };
    }
    return { success: false };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (_) {}
  }, []);

  const isRouteAuthorized = useCallback((pathname: string) => {
    if (!user) return false;
    return isPathAllowedForUser(user, pathname);
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    quickLogin,
    logout,
    isRouteAuthorized,
    isNocEngineer: user?.roleType === "noc_engineer",
    isRegionalOps: user?.roleType === "regional_ops",
    isCxLead: user?.roleType === "cx_lead",
    isLeadership: user?.roleType === "leadership",
  }), [user, isLoading, login, quickLogin, logout, isRouteAuthorized]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
