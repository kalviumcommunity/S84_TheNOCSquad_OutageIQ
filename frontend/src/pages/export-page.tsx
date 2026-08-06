import SectionHeader from '../components/SectionHeader';
import type { OutageRecord } from '../types';

export default function ExportPage({ outages }: { outages: OutageRecord[] }) {
  return (
    <div className="stack">
      <SectionHeader title="Export Page" subtitle="Leadership-ready top outages preview and CSV/PDF placeholders backed by the API." />
      <div className="panel-grid">
        <section className="panel">
          <h3>Top 5 Export Preview</h3>
          <div className="queue-list">
            {outages.slice(0, 5).map((item, index) => (
              <div className="queue-row" key={item.id}>
                <strong>#{index + 1} {item.id}</strong>
                <span>{item.region}</span>
                <span>{item.impactScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Download Actions</h3>
          <button className="primary-button">Export CSV</button>
          <button className="ghost-button">Export PDF Summary</button>
        </section>
      </div>
    </div>
  );
}