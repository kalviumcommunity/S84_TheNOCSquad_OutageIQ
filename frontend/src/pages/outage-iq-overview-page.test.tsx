import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OverviewPage from './outage-iq-overview-page';
import type { DashboardPayload } from '../types';

const mockDashboardData: DashboardPayload = {
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
      rootCause: 'Core fiber cut',
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
};

describe('OverviewPage Component', () => {
  it('renders section title and KPI cards', () => {
    render(<OverviewPage data={mockDashboardData} />);

    expect(screen.getByText('Outage IQ Overview Page')).toBeInTheDocument();
    expect(screen.getByText('Active Outages')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    expect(screen.getByText('2.48M')).toBeInTheDocument();
  });

  it('renders priority queue snapshot and executive callout', () => {
    render(<OverviewPage data={mockDashboardData} />);

    expect(screen.getByText('OUT-101')).toBeInTheDocument();
    expect(screen.getByText(/Mumbai • MUM-01/i)).toBeInTheDocument();
    expect(screen.getByText('94.2')).toBeInTheDocument();
    expect(screen.getByText(/Revenue at risk: ₹8.76 Cr/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly outages: 84/i)).toBeInTheDocument();
    expect(screen.getByText(/SLA compliance: 84%/i)).toBeInTheDocument();
  });
});
