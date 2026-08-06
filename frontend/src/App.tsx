import { useEffect, useState } from 'react';
import { getAnalytics, getOutages, getOverview, getRegions } from './lib/api';
import LandingPage from './pages/landing-page';
import LoginPage from './pages/login-page';
import OverviewPage from './pages/outage-iq-overview-page';
import QueuePage from './pages/outage-queue-page';
import RegionalViewPage from './pages/regional-view-page';
import AnalyticsPage from './pages/analytics-page';
import ExportPage from './pages/export-page';
import Shell from './components/Shell';
import type { AnalyticsPayload, AppUser, DashboardPayload, OutageRecord, PageKey, RegionRecord } from './types';

export default function App() {
  const [page, setPage] = useState<PageKey>('landing');
  const [user, setUser] = useState<AppUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [regions, setRegions] = useState<RegionRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [outages, setOutages] = useState<OutageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = sessionStorage.getItem('outageiq_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser) as AppUser);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [overviewData, regionData, analyticsData, outageData] = await Promise.all([
          getOverview(),
          getRegions(),
          getAnalytics(),
          getOutages(),
        ]);
        setDashboard(overviewData);
        setRegions(regionData);
        setAnalytics(analyticsData);
        setOutages(outageData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user]);

  // Guest Landing View
  if (page === 'landing') {
    return (
      <LandingPage
        onNavigate={(nextPage) => {
          if (nextPage === 'overview' && !user) {
            setPage('login');
          } else {
            setPage(nextPage);
          }
        }}
        isLoggedIn={!!user}
      />
    );
  }

  // Unauthenticated Login View
  if (!user && page === 'login') {
    return (
      <LoginPage
        onLogin={(nextUser) => {
          setUser(nextUser);
          setPage('overview');
        }}
        onBackToLanding={() => setPage('landing')}
      />
    );
  }

  // Fallback if not logged in but on dashboard page
  if (!user) {
    return (
      <LoginPage
        onLogin={(nextUser) => {
          setUser(nextUser);
          setPage('overview');
        }}
        onBackToLanding={() => setPage('landing')}
      />
    );
  }

  return (
    <Shell
      user={user}
      activePage={page}
      onChangePage={setPage}
      onLogout={() => {
        sessionStorage.removeItem('outageiq_user');
        sessionStorage.removeItem('outageiq_token');
        setUser(null);
        setPage('landing');
      }}
    >
      {loading ? <div className="status-banner">Loading live dashboard data...</div> : null}
      {error ? <div className="error-banner">{error}</div> : null}
      {page === 'overview' && dashboard ? <OverviewPage data={dashboard} /> : null}
      {page === 'queue' ? <QueuePage outages={outages} /> : null}
      {page === 'regional' ? <RegionalViewPage regions={regions} /> : null}
      {page === 'analytics' && analytics ? <AnalyticsPage analytics={analytics.analytics} weeklySummary={analytics.weeklySummary} /> : null}
      {page === 'export' ? <ExportPage outages={outages} /> : null}
    </Shell>
  );
}