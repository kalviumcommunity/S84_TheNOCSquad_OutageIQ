"use client";

import DashboardLayout from "@/components/DashboardLayout";
import AnalyticsView from "@/components/AnalyticsView";

export default function AnalyticsPage() {
  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Trend analysis, complaint velocity, exec summary"
      activeRoute="/analytics"
    >
      <AnalyticsView />
    </DashboardLayout>
  );
}
