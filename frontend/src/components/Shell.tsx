import type { PageKey, AppUser } from '../types';

const pages: Array<{ key: PageKey; label: string; note: string }> = [
  { key: 'overview', label: 'Outage IQ Overview', note: 'Command center' },
  { key: 'queue', label: 'Outage Queue', note: 'Ranked incidents' },
  { key: 'regional', label: 'Regional View', note: 'Geo impact' },
  { key: 'analytics', label: 'Analytics', note: 'Trends and velocity' },
  { key: 'export', label: 'Export', note: 'Executive summary' },
];

export default function Shell({
  user,
  activePage,
  onChangePage,
  onLogout,
  children,
}: {
  user: AppUser;
  activePage: PageKey;
  onChangePage: (page: PageKey) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">OQ</div>
          <div>
            <div className="brand-title">OutageIQ</div>
            <div className="brand-subtitle">The NOC Squad</div>
          </div>
        </div>

        <div className="sidebar-section-title">Navigation</div>
        {pages.map((page) => (
          <button
            key={page.key}
            className={`nav-item ${activePage === page.key ? 'active' : ''}`}
            onClick={() => onChangePage(page.key)}
          >
            <strong>{page.label}</strong>
            <span>{page.note}</span>
          </button>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-section-title">Session</div>
          <div className="user-chip">
            <span>{user.displayName}</span>
            <small>{user.role}</small>
          </div>
          <button className="ghost-button" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <h1>{pages.find((page) => page.key === activePage)?.label}</h1>
            <p>Backend connected and serving live demo outage data.</p>
          </div>
          <div className="topbar-meta">
            <span>Real-time demo feed</span>
            <span>Logged in as {user.username}</span>
          </div>
        </header>
        <section className="page-frame">{children}</section>
      </main>
    </div>
  );
}