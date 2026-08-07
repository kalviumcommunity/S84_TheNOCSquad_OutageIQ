import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegionalViewPage from './regional-view-page';
import type { RegionRecord } from '../types';

const mockRegions: RegionRecord[] = [
  { region: 'Mumbai', score: 94, subscribers: '4.2M', tier: 'Premium', outages: 5 },
  { region: 'Delhi NCR', score: 90, subscribers: '3.8M', tier: 'Premium', outages: 4 },
];

describe('RegionalViewPage Component', () => {
  it('renders regional scores and details', () => {
    render(<RegionalViewPage regions={mockRegions} />);

    expect(screen.getByText('Regional View Page')).toBeInTheDocument();
    expect(screen.getByText('Mumbai')).toBeInTheDocument();
    expect(screen.getByText('4.2M subscribers')).toBeInTheDocument();
    expect(screen.getByText('94')).toBeInTheDocument();
    expect(screen.getByText('Delhi NCR')).toBeInTheDocument();
    expect(screen.getByText('3.8M subscribers')).toBeInTheDocument();
  });
});
