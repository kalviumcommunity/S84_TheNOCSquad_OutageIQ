"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ExportView from "@/components/ExportView";

export default function ExportableDataAliasPage() {
  return (
    <DashboardLayout
      title="Exportable Data"
      subtitle="Download reports in CSV or PDF format"
      activeRoute="/exportable-data"
    >
      <ExportView />
    </DashboardLayout>
  );
}
