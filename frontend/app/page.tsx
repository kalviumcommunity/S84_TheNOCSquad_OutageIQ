"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import OverviewView from "@/components/OverviewView";

export default function Home() {
  return (
    <DashboardLayout
      title="Overview"
      subtitle="Real-time network outage impact prioritization"
      activeRoute="/"
    >
      <OverviewView />
    </DashboardLayout>
  );
}
