"use client";

import DashboardLayout from "@/components/DashboardLayout";
import QueueView from "@/components/QueueView";

export default function QueuePage() {
  return (
    <DashboardLayout
      title="Outage Queue"
      subtitle="Full prioritized list ranked by Impact Score"
      activeRoute="/queue"
    >
      <QueueView />
    </DashboardLayout>
  );
}
