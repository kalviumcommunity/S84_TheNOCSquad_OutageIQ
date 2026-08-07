import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExportPage from './export-page';
import type { OutageRecord } from '../types';

const mockOutages: OutageRecord[] = [
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
];

describe('ExportPage Component', () => {
  it('renders top export preview rows and action buttons', () => {
    render(<ExportPage outages={mockOutages} />);

    expect(screen.getByText('Export Page')).toBeInTheDocument();
    expect(screen.getByText('Top 5 Export Preview')).toBeInTheDocument();
    expect(screen.getByText('#1 OUT-101')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export PDF Summary/i })).toBeInTheDocument();
  });
});
