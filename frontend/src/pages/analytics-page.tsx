import SectionHeader from '../components/SectionHeader';

export default function AnalyticsPage({
  analytics,
  weeklySummary,
}: {
  analytics: {
    trend: Array<{ date: string; outages: number; avgImpact: number }>;
    complaintsByHour: Array<{ hour: string; complaints: number }>;
  };
  weeklySummary: {
    totalOutages: number;
    avgResolution: string;
    revenueAtRisk: string;
    slaCompliance: number;
  };
}) {
  const maxOutages = Math.max(...analytics.trend.map((item) => item.outages));

  return (
    <div className="stack">
      <SectionHeader title="Analytics Page" subtitle="Trend view, complaint velocity, and weekly leadership numbers from the backend." />

      <div className="panel-grid">
        <section className="panel">
          <h3>7-Day Outage Trend</h3>
          <div className="bar-chart">
            {analytics.trend.map((item) => (
              <div key={item.date} className="bar-column">
                <div className="bar-value">{item.outages}</div>
                <div className="bar-track"><span style={{ height: `${(item.outages / maxOutages) * 100}%` }} /></div>
                <small>{item.date}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Complaint Velocity</h3>
          <div className="queue-list">
            {analytics.complaintsByHour.map((item) => (
              <div className="queue-row" key={item.hour}>
                <strong>{item.hour}</strong>
                <span>{item.complaints} complaints</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="kpi-grid">
        <article className="kpi-card"><span>Total Outages</span><strong>{weeklySummary.totalOutages}</strong></article>
        <article className="kpi-card"><span>Avg Resolution</span><strong>{weeklySummary.avgResolution}</strong></article>
        <article className="kpi-card"><span>Revenue at Risk</span><strong>{weeklySummary.revenueAtRisk}</strong></article>
        <article className="kpi-card"><span>SLA Compliance</span><strong>{weeklySummary.slaCompliance}%</strong></article>
      </div>
    </div>
  );
}