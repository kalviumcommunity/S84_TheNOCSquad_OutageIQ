import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QueuePage from './outage-queue-page';
import type { OutageRecord } from '../types';

const mockOutages: OutageRecord[] = [
  {
    id: 'OUT-MUM-1',
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
  {
    id: 'OUT-BLR-2',
    region: 'Bangalore',
    node: 'BLR-02',
    severity: 'High',
    status: 'Investigating',
    priority: 'P2',
    impactScore: 76.8,
    subscribers: 2900000,
    complaints: 940,
    complaintVelocity: 280,
    revenueExposure: '₹88 L/hr',
    duration: '2h 48m',
    rootCause: 'Microwave degradation',
    reachScore: 78,
    complaintScore: 77,
    revenueScore: 74,
    durationScore: 79,
  },
];

describe('QueuePage Component', () => {
  it('renders title and outage list table', () => {
    render(<QueuePage outages={mockOutages} />);

    expect(screen.getByText('Outage Queue Page')).toBeInTheDocument();
    expect(screen.getByText('2 outages visible')).toBeInTheDocument();
    expect(screen.getByText('OUT-MUM-1')).toBeInTheDocument();
    expect(screen.getByText('OUT-BLR-2')).toBeInTheDocument();
  });

  it('filters outages by severity selection', () => {
    render(<QueuePage outages={mockOutages} />);

    const select = screen.getByLabelText(/Severity Filter/i);
    fireEvent.change(select, { target: { value: 'Critical' } });

    expect(screen.getByText('1 outages visible')).toBeInTheDocument();
    expect(screen.getByText('OUT-MUM-1')).toBeInTheDocument();
    expect(screen.queryByText('OUT-BLR-2')).not.toBeInTheDocument();
  });
});
