"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { INITIAL_OUTAGES, OutageItem, PERSONAS, PersonaInfo } from "@/lib/data";
import { fetchOutages } from "@/lib/api";

export interface StatusFilter {
  open: boolean;
  inProgress: boolean;
  resolved: boolean;
}

export interface FilterContextType {
  // Region filter
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;

  // Priority / Severity filter
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;

  // Status checkbox filter
  statusFilter: StatusFilter;
  setStatusFilter: React.Dispatch<React.SetStateAction<StatusFilter>>;

  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Sort field
  sortField: "score" | "complaints" | "duration";
  setSortField: (sort: "score" | "complaints" | "duration") => void;

  // Raw and Filtered Outages
  allOutages: OutageItem[];
  setAllOutages: React.Dispatch<React.SetStateAction<OutageItem[]>>;
  filteredOutages: OutageItem[];
  sortedOutages: OutageItem[];
  refreshOutages: () => Promise<void>;
  isLoading: boolean;

  // Dynamic Priority counts for sidebar and badges
  priorityCounts: { p1: number; p2: number; p3: number; total: number };

  // Status counts
  statusCounts: { open: number; inProgress: number; resolved: number; total: number };

  // Active filter status and reset
  hasActiveFilters: boolean;
  resetFilters: () => void;

  // Persona management
  selectedPersona: PersonaInfo;
  setSelectedPersona: (persona: PersonaInfo) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>({
    open: true,
    inProgress: true,
    resolved: true,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<"score" | "complaints" | "duration">("score");
  const [allOutages, setAllOutages] = useState<OutageItem[]>(INITIAL_OUTAGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaInfo>(PERSONAS[0]);

  // Read URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const regionParam = urlParams.get("region");
      const priorityParam = urlParams.get("priority") || urlParams.get("severity");
      const statusParam = urlParams.get("status");

      if (regionParam) {
        setSelectedRegion(regionParam);
      }
      if (priorityParam) {
        setSelectedPriority(priorityParam);
      }
      if (statusParam) {
        const s = statusParam.toLowerCase();
        if (s === "open") setStatusFilter({ open: true, inProgress: false, resolved: false });
        else if (s === "in_progress" || s === "in progress" || s === "active_triage") setStatusFilter({ open: false, inProgress: true, resolved: false });
        else if (s === "resolved") setStatusFilter({ open: false, inProgress: false, resolved: true });
      }
    }
  }, []);

  // Fetch outages from API
  const refreshOutages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchOutages();
      if (data && data.length > 0) {
        setAllOutages(data);
      }
    } catch {
      // Keep initial outages on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchOutages()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setAllOutages(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic priority counts calculated from all outages (scoped to selected region if filtered)
  const priorityCounts = useMemo(() => {
    const regionOutages = selectedRegion === "ALL"
      ? allOutages
      : allOutages.filter((o) => o.region.toLowerCase() === selectedRegion.toLowerCase() || o.regionCode.toLowerCase() === selectedRegion.toLowerCase());

    let p1 = 0;
    let p2 = 0;
    let p3 = 0;

    regionOutages.forEach((o) => {
      const p = (o.priority || "").toUpperCase();
      const s = (o.severity || "").toUpperCase();
      if (p === "P1" || s === "CRITICAL") p1++;
      else if (p === "P2" || s === "HIGH") p2++;
      else if (p === "P3" || s === "MEDIUM" || s === "LOW") p3++;
    });

    return { p1, p2, p3, total: regionOutages.length };
  }, [allOutages, selectedRegion]);

  // Status counts
  const statusCounts = useMemo(() => {
    const regionOutages = selectedRegion === "ALL"
      ? allOutages
      : allOutages.filter((o) => o.region.toLowerCase() === selectedRegion.toLowerCase() || o.regionCode.toLowerCase() === selectedRegion.toLowerCase());

    let open = 0;
    let inProgress = 0;
    let resolved = 0;

    regionOutages.forEach((o) => {
      const s = (o.status || "").toLowerCase();
      if (s === "open") open++;
      else if (s === "in progress" || s === "in_progress" || s === "active triage" || s === "active_triage" || s === "investigating" || s === "resolving") inProgress++;
      else if (s === "resolved" || s === "closed") resolved++;
    });

    return { open, inProgress, resolved, total: regionOutages.length };
  }, [allOutages, selectedRegion]);

  // Filter outages across all dimensions (Region, Priority/Severity, Status, Search)
  const filteredOutages = useMemo(() => {
    return allOutages.filter((outage) => {
      // 1. Region Filter
      const matchRegion =
        selectedRegion === "ALL" ||
        outage.region.toLowerCase() === selectedRegion.toLowerCase() ||
        outage.regionCode.toLowerCase() === selectedRegion.toLowerCase();

      // 2. Priority / Severity Filter
      let matchPriority = true;
      if (selectedPriority !== "ALL") {
        const sp = selectedPriority.toUpperCase();
        const op = (outage.priority || "").toUpperCase();
        const os = (outage.severity || "").toUpperCase();

        if (sp === "P1" || sp === "CRITICAL") {
          matchPriority = op === "P1" || os === "CRITICAL";
        } else if (sp === "P2" || sp === "HIGH") {
          matchPriority = op === "P2" || os === "HIGH";
        } else if (sp === "P3" || sp === "MEDIUM" || sp === "LOW") {
          matchPriority = op === "P3" || os === "MEDIUM" || os === "LOW";
        } else {
          matchPriority = op === sp || os === sp;
        }
      }

      // 3. Status Filter (Multi-checkbox)
      let matchStatus = true;
      const isAnyStatusChecked = statusFilter.open || statusFilter.inProgress || statusFilter.resolved;
      if (isAnyStatusChecked) {
        const s = (outage.status || "").toLowerCase();
        const isOpen = s === "open";
        const isInProgress =
          s === "in progress" ||
          s === "in_progress" ||
          s === "active triage" ||
          s === "active_triage" ||
          s === "investigating" ||
          s === "resolving";
        const isResolved = s === "resolved" || s === "closed";

        matchStatus =
          (statusFilter.open && isOpen) ||
          (statusFilter.inProgress && isInProgress) ||
          (statusFilter.resolved && isResolved);
      } else {
        matchStatus = false;
      }

      // 4. Search Query Filter
      let matchSearch = true;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        matchSearch =
          outage.id.toLowerCase().includes(q) ||
          outage.shortId.toLowerCase().includes(q) ||
          outage.region.toLowerCase().includes(q) ||
          outage.node.toLowerCase().includes(q) ||
          outage.rootCause.toLowerCase().includes(q) ||
          outage.severity.toLowerCase().includes(q) ||
          outage.priority.toLowerCase().includes(q);
      }

      return matchRegion && matchPriority && matchStatus && matchSearch;
    });
  }, [allOutages, selectedRegion, selectedPriority, statusFilter, searchQuery]);

  // Sort filtered outages
  const sortedOutages = useMemo(() => {
    return [...filteredOutages].sort((a, b) => {
      if (sortField === "score") return b.impactScore - a.impactScore;
      if (sortField === "complaints") return b.complaints - a.complaints;
      if (sortField === "duration") return b.durationHours - a.durationHours;
      return 0;
    });
  }, [filteredOutages, sortField]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedRegion !== "ALL" ||
      selectedPriority !== "ALL" ||
      !statusFilter.open ||
      !statusFilter.inProgress ||
      !statusFilter.resolved ||
      searchQuery.trim() !== ""
    );
  }, [selectedRegion, selectedPriority, statusFilter, searchQuery]);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setSelectedRegion("ALL");
    setSelectedPriority("ALL");
    setStatusFilter({ open: true, inProgress: true, resolved: true });
    setSearchQuery("");
    setSortField("score");
  }, []);

  const value = useMemo(
    () => ({
      selectedRegion,
      setSelectedRegion,
      selectedPriority,
      setSelectedPriority,
      statusFilter,
      setStatusFilter,
      searchQuery,
      setSearchQuery,
      sortField,
      setSortField,
      allOutages,
      setAllOutages,
      filteredOutages,
      sortedOutages,
      refreshOutages,
      isLoading,
      priorityCounts,
      statusCounts,
      hasActiveFilters,
      resetFilters,
      selectedPersona,
      setSelectedPersona,
    }),
    [
      selectedRegion,
      selectedPriority,
      statusFilter,
      searchQuery,
      sortField,
      allOutages,
      filteredOutages,
      sortedOutages,
      refreshOutages,
      isLoading,
      priorityCounts,
      statusCounts,
      hasActiveFilters,
      resetFilters,
      selectedPersona,
    ]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
