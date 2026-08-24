"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import OverviewView from "@/components/OverviewView";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ImpactCalculator from "@/components/ImpactCalculator";
import ProblemSolution from "@/components/ProblemSolution";
import PersonasSection from "@/components/PersonasSection";
import RegionalImpactOverview from "@/components/RegionalImpactOverview";
import LiveQueuePreview from "@/components/LiveQueuePreview";
import ImpactTrendAnalytics from "@/components/ImpactTrendAnalytics";
import MethodologySection from "@/components/MethodologySection";
import PrdRequirementsExplorer from "@/components/PrdRequirementsExplorer";
import RoiCalculator from "@/components/RoiCalculator";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] text-gray-900 flex flex-col">
      {/* 1. Production NOC Dashboard (Figma Make Design Layout) */}
      <DashboardLayout
        title="Overview"
        subtitle="Real-time network outage impact prioritization"
        activeRoute="/"
      >
        <OverviewView />
      </DashboardLayout>

      {/* 2. Embedded PRD & Engineering Verification Modules */}
      <div className="border-t-4 border-purple-600/30 bg-gray-950 text-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-800 text-xs text-gray-400 flex items-center justify-between">
          <span className="font-mono font-bold text-purple-400 uppercase tracking-wider">
            ⚙️ PRD Engineering Verification &amp; Scoring Simulator Suite
          </span>
          <span className="text-gray-500 font-mono text-[11px]">
            PRD v1.0 Spec · 4-Factor Simulator · Temporal Associator
          </span>
        </div>

        {/* Header & Navbar for E2E Test Compatibility */}
        <Navbar />

        <main className="flex-grow">
          <Hero />
          <ImpactCalculator />
          <ProblemSolution />
          <PersonasSection />
          <RegionalImpactOverview />
          <LiveQueuePreview />
          <ImpactTrendAnalytics />
          <MethodologySection />
          <PrdRequirementsExplorer />
          <RoiCalculator />
        </main>

        <Footer />
      </div>
    </div>
  );
}
