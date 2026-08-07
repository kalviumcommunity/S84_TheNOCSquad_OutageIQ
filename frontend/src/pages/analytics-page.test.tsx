import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from './analytics-page';

const mockAnalytics = {
  trend: [
    { date: 'Jul 30', outages: 8, avgImpact: 52 },
    { date: 'Jul 31', outages: 10, avgImpact: 57 },
  ],
  complaintsByHour: [
    { hour: '06:00', complaints: 120 },
    { hour: '08:00', complaints: 240 },
  ],
};

const mockWeeklySummary = {
  totalOutages: 84,
  avgResolution: '3h 52m',
  revenueAtRisk: '₹42.3 Cr',
  slaCompliance: 84,
};

describe('AnalyticsPage Component', () => {
  it('renders trend chart, complaint velocity, and weekly summary cards', () => {
    render(<AnalyticsPage analytics={mockAnalytics} weeklySummary={mockWeeklySummary} />);

    expect(screen.getByText('Analytics Page')).toBeInTheDocument();
    expect(screen.getByText('7-Day Outage Trend')).toBeInTheDocument();
    expect(screen.getByText('Jul 30')).toBeInTheDocument();
    expect(screen.getByText('Complaint Velocity')).toBeInTheDocument();
    expect(screen.getByText('06:00')).toBeInTheDocument();
    expect(screen.getByText('120 complaints')).toBeInTheDocument();
    expect(screen.getByText('Total Outages')).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('₹42.3 Cr')).toBeInTheDocument();
  });
});
