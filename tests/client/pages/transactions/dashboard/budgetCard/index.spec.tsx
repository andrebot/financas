import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { useListBudgetsQuery } from '../../../../../../src/client/features/budget';
import BudgetCard from '../../../../../../src/client/pages/transactions/dashboard/budgetCard';

jest.mock('../../../../../../src/client/features/budget', () => ({
  useListBudgetsQuery: jest.fn(),
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

describe('BudgetCard', () => {
  // Selected month: January 2025 (index 0)
  const defaultProps = { selectedYear: 2025, selectedMonth: 0 };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders budgets that overlap the selected month', () => {
    (useListBudgetsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Food Budget',
          value: 500,
          spent: 200,
          startDate: dayjs('2025-01-01').toISOString(),
          endDate: dayjs('2025-01-31').toISOString(),
        },
      ],
    });

    render(<BudgetCard {...defaultProps} />);
    expect(screen.getByText('Food Budget')).toBeInTheDocument();
  });

  it('filters out budgets that end before the selected month', () => {
    (useListBudgetsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Old Budget',
          value: 300,
          spent: 100,
          startDate: dayjs('2024-10-01').toISOString(),
          endDate: dayjs('2024-12-31').toISOString(), // ends before Jan 2025
        },
        {
          id: 2,
          name: 'Current Budget',
          value: 500,
          spent: 200,
          startDate: dayjs('2025-01-01').toISOString(),
          endDate: dayjs('2025-03-31').toISOString(),
        },
      ],
    });

    render(<BudgetCard {...defaultProps} />);
    expect(screen.queryByText('Old Budget')).not.toBeInTheDocument();
    expect(screen.getByText('Current Budget')).toBeInTheDocument();
  });

  it('filters out budgets that start after the selected month', () => {
    (useListBudgetsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Future Budget',
          value: 400,
          spent: 0,
          startDate: dayjs('2025-02-01').toISOString(), // starts after Jan 2025
          endDate: dayjs('2025-06-30').toISOString(),
        },
        {
          id: 2,
          name: 'Ongoing Budget',
          value: 600,
          spent: 100,
          startDate: dayjs('2024-11-01').toISOString(),
          endDate: dayjs('2025-02-28').toISOString(),
        },
      ],
    });

    render(<BudgetCard {...defaultProps} />);
    expect(screen.queryByText('Future Budget')).not.toBeInTheDocument();
    expect(screen.getByText('Ongoing Budget')).toBeInTheDocument();
  });

  it('renders "budget" as title', () => {
    (useListBudgetsQuery as jest.Mock).mockReturnValue({ data: [] });

    render(<BudgetCard {...defaultProps} />);
    expect(screen.getByText('budget')).toBeInTheDocument();
  });

  it('uses 0 for current when budget.spent is undefined', () => {
    (useListBudgetsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'No Spent Budget',
          value: 500,
          spent: undefined,
          startDate: dayjs('2025-01-01').toISOString(),
          endDate: dayjs('2025-01-31').toISOString(),
        },
      ],
    });

    render(<BudgetCard {...defaultProps} />);
    expect(screen.getByText('No Spent Budget')).toBeInTheDocument();
  });

  it('uses empty array default when query data is undefined', () => {
    (useListBudgetsQuery as jest.Mock).mockReturnValue({});
    expect(() => render(<BudgetCard {...defaultProps} />)).not.toThrow();
  });
});
