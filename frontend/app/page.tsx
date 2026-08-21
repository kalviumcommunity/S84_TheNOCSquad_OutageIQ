"use client";

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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Interactive Impact Calculator / Simulator (PRD Sec 7) */}
        <ImpactCalculator />

        {/* Problem vs Solution Matrix (PRD Sec 1 & 2) */}
        <ProblemSolution />

        {/* Persona Experiences (PRD Sec 4) */}
        <PersonasSection />

        {/* Regional Impact Heatmap & Geo-Operational Analytics (PRD Sec 8.3 & FR11) */}
        <RegionalImpactOverview />

        {/* Interactive Triage Queue Dashboard Preview (PRD Sec 8.3 & FR9-FR10, FR16 Alerting, FR8 KPIs) */}
        <LiveQueuePreview />

        {/* Rolling Outage Volume & Historical Trend Analytics (PRD Sec 8.3 & FR12) */}
        <ImpactTrendAnalytics />

        {/* Scoring Methodology Pipeline (PRD Sec 6 & 7) */}
        <MethodologySection />

        {/* Technical PRD Requirements Explorer (FR1-FR16 & NFRs) */}
        <PrdRequirementsExplorer />

        {/* Business Case & ROI Savings Calculator (PRD Sec 10) */}
        <RoiCalculator />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
