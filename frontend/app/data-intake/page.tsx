"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import IngestView from "@/components/IngestView";

export default function DataIntakePage() {
  return (
    <DashboardLayout
      title="Data Ingestion & Scoring Engine"
      subtitle="Executive Director telemetry ingress, batch CSV pipeline, and mathematical prioritization"
      activeRoute="/data-intake"
    >
      <IngestView />
    </DashboardLayout>
  );
}
