"use client";

import React, { useState } from "react";
import { Calendar, RefreshCw, ChevronDown, User, Check, ShieldCheck, Sparkles } from "lucide-react";
import { PERSONAS, PersonaInfo } from "@/lib/data";

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  selectedPersona?: PersonaInfo;
  onSelectPersona?: (persona: PersonaInfo) => void;
}

export default function Header({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  selectedPersona = PERSONAS[0],
  onSelectPersona
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshSpin, setRefreshSpin] = useState(false);

  const handleRefreshClick = () => {
    setRefreshSpin(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setRefreshSpin(false), 800);
  };

  return (
    <div className="dashboard-topbar flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 mb-6 select-none">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
          {title}
        </h2>
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

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 pl-1.5 pr-3 py-1.5 rounded-xl shadow-xs text-xs font-semibold text-gray-800 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
              {selectedPersona.initials}
            </div>
            <span>{selectedPersona.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Persona Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                  Operational Personas & View Switcher
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Select an operational persona to highlight their tailored workflow:
                </p>
              </div>

              <div className="space-y-1">
                {PERSONAS.map((p) => {
                  const isSelected = p.id === selectedPersona.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPersona && onSelectPersona(p)}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-2.5 ${
                        isSelected ? "bg-purple-50 text-purple-900 border border-purple-200/70" : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
                      }`}>
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">{p.name}</span>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {p.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {p.focus}
                        </p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
