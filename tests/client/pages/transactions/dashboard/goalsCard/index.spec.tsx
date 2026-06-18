import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useListGoalsForMonthQuery } from '../../../../../../src/client/features/goal';
import GoalsCard from '../../../../../../src/client/pages/transactions/dashboard/goalsCard';

jest.mock('../../../../../../src/client/features/goal', () => ({
  useListGoalsForMonthQuery: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock('../../../../../../src/client/components/progressCard', () => ({
  __esModule: true,
  default: ({ title, items }: { title: string; items: Array<{ id?: number; name: string }> }) => (
    <div>
      <span>{title}</span>
      {items.map((i) => (
        <span key={i.id ?? i.name}>{i.name}</span>
      ))}
    </div>
  ),
}));

describe('GoalsCard', () => {
  const defaultProps = { selectedYear: 2025, selectedMonth: 0 };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders with goals data and shows goal names', () => {
    (useListGoalsForMonthQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 1, name: 'Trip', value: 5000, savedValue: 1000, archived: false },
        { id: 2, name: 'Car', value: 20000, savedValue: 5000, archived: false },
      ],
    });

    render(<GoalsCard {...defaultProps} />);
    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.getByText('Car')).toBeInTheDocument();
  });

  it('filters out archived goals', () => {
    (useListGoalsForMonthQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 1, name: 'Active Goal', value: 5000, savedValue: 1000, archived: false },
        { id: 2, name: 'Archived Goal', value: 3000, savedValue: 3000, archived: true },
      ],
    });

    render(<GoalsCard {...defaultProps} />);
    expect(screen.getByText('Active Goal')).toBeInTheDocument();
    expect(screen.queryByText('Archived Goal')).not.toBeInTheDocument();
  });

  it('passes selectedYear and selectedMonth+1 to the query', () => {
    (useListGoalsForMonthQuery as jest.Mock).mockReturnValue({ data: [] });

    render(<GoalsCard selectedYear={2025} selectedMonth={2} />);
    expect(useListGoalsForMonthQuery).toHaveBeenCalledWith({ year: 2025, month: 3 });
  });

  it('renders "goals" as title', () => {
    (useListGoalsForMonthQuery as jest.Mock).mockReturnValue({ data: [] });

    render(<GoalsCard {...defaultProps} />);
    expect(screen.getByText('goals')).toBeInTheDocument();
  });

  it('uses empty array default when query data is undefined', () => {
    (useListGoalsForMonthQuery as jest.Mock).mockReturnValue({});
    expect(() => render(<GoalsCard {...defaultProps} />)).not.toThrow();
  });
});
