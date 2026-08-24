"use client";

import DashboardLayout from "@/components/DashboardLayout";
import RegionsView from "@/components/RegionsView";

export default function RegionsPage() {
  return (
    <DashboardLayout
      title="Region View"
      subtitle="Impact breakdown and ranking by telecom region"
      activeRoute="/regions"
    >
      <RegionsView />
    </DashboardLayout>
  );
}
