import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import * as api from './lib/api';

vi.mock('./lib/api', () => ({
  getOverview: vi.fn(),
  getRegions: vi.fn(),
  getAnalytics: vi.fn(),
  getOutages: vi.fn(),
  login: vi.fn(),
}));

describe('App Main Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    vi.mocked(api.getOverview).mockResolvedValue({
      summary: {
        activeOutages: 5,
        criticalOutages: 2,
        impactedCustomers: '2.48M',
        avgResolutionTime: '3h 42m',
        revenueAtRisk: '₹8.76 Cr',
      },
      outages: [
        {
          id: 'OUT-101',
          region: 'Mumbai',
          node: 'MUM-01',
          severity: 'Critical',
          status: 'Open',
          priority: 'P1',
          impactScore: 94.2,
          subscribers: 4200000,
          complaints: 1842,
          complaintVelocity: 486,
          revenueExposure: '₹1.8 Cr/hr',
          duration: '4h 12m',
          rootCause: 'Fiber cut',
          reachScore: 96,
          complaintScore: 95,
          revenueScore: 92,
          durationScore: 94,
        },
      ],
      weeklySummary: {
        totalOutages: 84,
        avgResolution: '3h 52m',
        revenueAtRisk: '₹42.3 Cr',
        slaCompliance: 84,
      },
    });

    vi.mocked(api.getRegions).mockResolvedValue([
      { region: 'Mumbai', score: 94, subscribers: '4.2M', tier: 'Premium', outages: 5 },
    ]);

    vi.mocked(api.getAnalytics).mockResolvedValue({
      analytics: {
        trend: [{ date: 'Jul 30', outages: 8, avgImpact: 52 }],
        complaintsByHour: [{ hour: '06:00', complaints: 120 }],
      },
      weeklySummary: {
        totalOutages: 84,
        avgResolution: '3h 52m',
        revenueAtRisk: '₹42.3 Cr',
        slaCompliance: 84,
      },
    });

    vi.mocked(api.getOutages).mockResolvedValue([
      {
        id: 'OUT-101',
        region: 'Mumbai',
        node: 'MUM-01',
        severity: 'Critical',
        status: 'Open',
        priority: 'P1',
        impactScore: 94.2,
        subscribers: 4200000,
        complaints: 1842,
        complaintVelocity: 486,
        revenueExposure: '₹1.8 Cr/hr',
        duration: '4h 12m',
        rootCause: 'Fiber cut',
        reachScore: 96,
        complaintScore: 95,
        revenueScore: 92,
        durationScore: 94,
      },
    ]);
  });

  it('renders LoginPage initially when no user session exists', () => {
    render(<App />);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('loads dashboard shell when stored user session exists', async () => {
    sessionStorage.setItem(
      'outageiq_user',
      JSON.stringify({ username: 'rahul', displayName: 'Rahul K.', role: 'NOC Engineer' })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Outage IQ Overview Page')).toBeInTheDocument();
      expect(screen.getByText('Rahul K.')).toBeInTheDocument();
    });
  });

  it('navigates between pages when sidebar links are clicked', async () => {
    sessionStorage.setItem(
      'outageiq_user',
      JSON.stringify({ username: 'rahul', displayName: 'Rahul K.', role: 'NOC Engineer' })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Outage IQ Overview Page')).toBeInTheDocument();
    });

    // Navigate to Queue
    fireEvent.click(screen.getByRole('button', { name: /Outage Queue/i }));
    expect(screen.getByText('Outage Queue Page')).toBeInTheDocument();

    // Navigate to Regional View
    fireEvent.click(screen.getByRole('button', { name: /Regional View/i }));
    expect(screen.getByText('Regional View Page')).toBeInTheDocument();

    // Navigate to Analytics
    fireEvent.click(screen.getByRole('button', { name: /Analytics/i }));
    expect(screen.getByText('Analytics Page')).toBeInTheDocument();

    // Navigate to Export
    fireEvent.click(screen.getByRole('button', { name: /Export/i }));
    expect(screen.getByText('Export Page')).toBeInTheDocument();
  });

  it('logs out user when Logout button is clicked', async () => {
    sessionStorage.setItem(
      'outageiq_user',
      JSON.stringify({ username: 'rahul', displayName: 'Rahul K.', role: 'NOC Engineer' })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Outage IQ Overview Page')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));

    expect(sessionStorage.getItem('outageiq_user')).toBeNull();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
