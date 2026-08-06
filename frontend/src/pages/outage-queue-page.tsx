import { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import type { OutageRecord } from '../types';

const severityClass: Record<OutageRecord['severity'], string> = {
  Critical: 'severity-critical',
  High: 'severity-high',
  Medium: 'severity-medium',
  Low: 'severity-low',
};

export default function QueuePage({ outages }: { outages: OutageRecord[] }) {
  const [severityFilter, setSeverityFilter] = useState<'All' | OutageRecord['severity']>('All');
  const filtered = useMemo(
    () => outages.filter((item) => severityFilter === 'All' || item.severity === severityFilter).sort((left, right) => right.impactScore - left.impactScore),
    [outages, severityFilter],
  );

  return (
    <div className="stack">
      <SectionHeader title="Outage Queue Page" subtitle="A ranked incident table sorted by Impact Score and filtered by severity." />
      <div className="toolbar">
        <label>
          Severity Filter
          <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as typeof severityFilter)}>
            <option value="All">All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
        <span>{filtered.length} outages visible</span>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Outage</th>
              <th>Region</th>
              <th>Impact</th>
              <th>Status</th>
              <th>Complaints</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.id}</strong>
                  <div>{item.node}</div>
                </td>
                <td>{item.region}</td>
                <td><strong>{item.impactScore.toFixed(1)}</strong></td>
                <td>{item.status}</td>
                <td>{item.complaints.toLocaleString()}</td>
                <td><span className={`severity-chip ${severityClass[item.severity]}`}>{item.priority}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}