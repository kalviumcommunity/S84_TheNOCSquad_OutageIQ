import SectionHeader from '../components/SectionHeader';
import type { RegionRecord } from '../types';

export default function RegionalViewPage({ regions }: { regions: RegionRecord[] }) {
  return (
    <div className="stack">
      <SectionHeader title="Regional View Page" subtitle="Regional impact scores and subscriber coverage shown from backend region data." />
      <div className="region-grid">
        {regions.map((region) => (
          <article className="panel" key={region.region}>
            <h3>{region.region}</h3>
            <p>{region.subscribers} subscribers</p>
            <div className="meter"><span style={{ width: `${region.score}%` }} /></div>
            <div className="region-footer">
              <strong>{region.score}</strong>
              <span>{region.tier}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}