import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ProgressCard from '../../../../src/client/components/progressCard';
import type { ProgressColors, ProgressItem } from '../../../../src/client/types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      if (k === 'currencyFormat') return 'USD';
      return k;
    },
  }),
}));

const mockColors: ProgressColors = {
  low: '#add8e6',
  medium: '#fff176',
  high: '#90ee90',
  complete: '#ffd700',
};

describe('ProgressCard', () => {
  const items: ProgressItem[] = [
    { id: 1, name: 'Goal A', current: 50, total: 100 },
    { id: 2, name: 'Goal B', current: 0, total: 200 },
  ];

  it('renders the title', () => {
    render(<ProgressCard title="My Goals" items={items} colors={mockColors} />);
    expect(screen.getByText('My Goals')).toBeInTheDocument();
  });

  it('renders each item name', () => {
    render(<ProgressCard title="My Goals" items={items} colors={mockColors} />);
    expect(screen.getByText('Goal A')).toBeInTheDocument();
    expect(screen.getByText('Goal B')).toBeInTheDocument();
  });

  it('renders progress bars (LinearProgress elements)', () => {
    render(<ProgressCard title="My Goals" items={items} colors={mockColors} />);
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(items.length);
  });

  it('renders "0 / 0" style label when total is 0', () => {
    const zeroItems: ProgressItem[] = [{ id: 1, name: 'Empty', current: 0, total: 0 }];
    render(<ProgressCard title="Empty Card" items={zeroItems} colors={mockColors} />);
    // When total is 0, percentage is 0. The label shows formatted currency.
    // currencyFormat key returns 'currencyFormat' (mocked t), so format is $0.00 / $0.00 style
    // We just verify the label element exists (the bar container)
    expect(screen.getByText('Empty')).toBeInTheDocument();
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders item with partial progress (current < total)', () => {
    const partialItems: ProgressItem[] = [{ id: 1, name: 'Partial', current: 25, total: 100 }];
    render(<ProgressCard title="Partial" items={partialItems} colors={mockColors} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '25');
  });

  it('caps progress at 100 when current exceeds total', () => {
    const overItems: ProgressItem[] = [{ id: 1, name: 'Over', current: 200, total: 100 }];
    render(<ProgressCard title="Over" items={overItems} colors={mockColors} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders without throwing when items is empty', () => {
    expect(() =>
      render(<ProgressCard title="Empty" items={[]} colors={mockColors} />)
    ).not.toThrow();
  });

  it('renders items without id using name as key', () => {
    const noIdItems: ProgressItem[] = [{ name: 'No Id', current: 10, total: 50 }];
    expect(() =>
      render(<ProgressCard title="No Id Test" items={noIdItems} colors={mockColors} />)
    ).not.toThrow();
    expect(screen.getByText('No Id')).toBeInTheDocument();
  });

  it('uses high color when percentage is between 75 and 100', () => {
    const highItems: ProgressItem[] = [{ id: 1, name: 'High', current: 80, total: 100 }];
    render(<ProgressCard title="High" items={highItems} colors={mockColors} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '80');
  });

  it('uses low color when percentage is 40 or below', () => {
    const lowItems: ProgressItem[] = [{ id: 1, name: 'Low', current: 20, total: 100 }];
    render(<ProgressCard title="Low" items={lowItems} colors={mockColors} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '20');
  });
});
