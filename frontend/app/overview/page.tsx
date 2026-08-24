"use client";

import DashboardLayout from "@/components/DashboardLayout";
import OverviewView from "@/components/OverviewView";

export default function OverviewPage() {
  return (
    <DashboardLayout
      title="Overview"
      subtitle="Real-time network outage impact prioritization"
      activeRoute="/overview"
    >
      <OverviewView />
    </DashboardLayout>
  );
}
