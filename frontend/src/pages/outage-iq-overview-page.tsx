import SectionHeader from '../components/SectionHeader';
import type { DashboardPayload, OutageRecord } from '../types';

const severityClass: Record<OutageRecord['severity'], string> = {
  Critical: 'severity-critical',
  High: 'severity-high',
  Medium: 'severity-medium',
  Low: 'severity-low',
};

export default function OverviewPage({ data }: { data: DashboardPayload }) {
  const topOutages = data.outages.slice(0, 4);

  return (
    <div className="stack">
      <SectionHeader title="Outage IQ Overview Page" subtitle="A live NOC command view fed by the backend summary endpoint." />
      <div className="kpi-grid">
        <article className="kpi-card"><span>Active Outages</span><strong>{data.summary.activeOutages}</strong></article>
        <article className="kpi-card"><span>Critical</span><strong>{data.summary.criticalOutages}</strong></article>
        <article className="kpi-card"><span>Customers Impacted</span><strong>{data.summary.impactedCustomers}</strong></article>
        <article className="kpi-card"><span>Avg Resolution</span><strong>{data.summary.avgResolutionTime}</strong></article>
      </div>

      <div className="panel-grid">
        <section className="panel">
          <h3>Priority Queue Snapshot</h3>
          <div className="queue-list">
            {topOutages.map((item) => (
              <div key={item.id} className="queue-row">
                <div>
                  <strong>{item.id}</strong>
                  <span>{item.region} • {item.node}</span>
                </div>
                <div>
                  <span className={`severity-chip ${severityClass[item.severity]}`}>{item.severity}</span>
                  <strong>{item.impactScore.toFixed(1)}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Executive Callout</h3>
          <p className="callout">Revenue at risk: {data.summary.revenueAtRisk}</p>
          <p>Weekly outages: {data.weeklySummary.totalOutages}</p>
          <p>SLA compliance: {data.weeklySummary.slaCompliance}%</p>
        </section>
      </div>
    </div>
  );
}