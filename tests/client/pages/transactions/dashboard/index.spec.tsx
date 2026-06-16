import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { useListTransactionsQuery } from '../../../../../src/client/features/transaction';
import Dashboard from '../../../../../src/client/pages/transactions/dashboard';
import { TRANSACTION_TYPES } from '../../../../../src/client/enums';

jest.mock('../../../../../src/client/features/transaction', () => ({
  useListTransactionsQuery: jest.fn(),
}));

jest.mock('../../../../../src/client/pages/transactions/dashboard/dashboardHeader', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="dashboard-header" data-year={props.selectedYear} data-month={props.selectedMonth} data-oldest={props.oldestYear} />
  ),
}));

jest.mock('../../../../../src/client/pages/transactions/dashboard/bankAccountBalances', () => ({
  __esModule: true,
  default: () => <div data-testid="bank-balances" />,
}));

jest.mock('../../../../../src/client/pages/transactions/dashboard/goalsCard', () => ({
  __esModule: true,
  default: () => <div data-testid="goals-card" />,
}));

jest.mock('../../../../../src/client/pages/transactions/dashboard/budgetCard', () => ({
  __esModule: true,
  default: () => <div data-testid="budget-card" />,
}));

jest.mock('../../../../../src/client/pages/transactions/dashboard/creditCardBalances', () => ({
  __esModule: true,
  default: () => <div data-testid="credit-card-balances" />,
}));

describe('Dashboard', () => {
  const currentYear = dayjs().year();
  const currentMonth = dayjs().month();

  beforeEach(() => {
    jest.resetAllMocks();
    (useListTransactionsQuery as jest.Mock).mockReturnValue({ data: [] });
  });

  it('renders all child components', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('bank-balances')).toBeInTheDocument();
    expect(screen.getByTestId('goals-card')).toBeInTheDocument();
    expect(screen.getByTestId('budget-card')).toBeInTheDocument();
    expect(screen.getByTestId('credit-card-balances')).toBeInTheDocument();
  });

  it('DashboardHeader receives selectedYear and selectedMonth props', () => {
    render(<Dashboard />);
    const header = screen.getByTestId('dashboard-header');
    expect(header).toHaveAttribute('data-year', String(currentYear));
    expect(header).toHaveAttribute('data-month', String(currentMonth));
  });

  it('oldestYear defaults to currentYear when there are no transactions', () => {
    render(<Dashboard />);
    const header = screen.getByTestId('dashboard-header');
    expect(header).toHaveAttribute('data-oldest', String(currentYear));
  });

  it('uses empty array default when transactions data is undefined', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({});
    expect(() => render(<Dashboard />)).not.toThrow();
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
  });

  it('with transactions, oldestYear is the earliest transaction year', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 1, name: 'Old', value: 10, type: TRANSACTION_TYPES.DEPOSIT, date: '2020-06-15T10:00:00Z', accountId: 1, userId: 1 },
        { id: 2, name: 'Recent', value: 20, type: TRANSACTION_TYPES.DEPOSIT, date: '2024-03-10T10:00:00Z', accountId: 1, userId: 1 },
      ],
    });

    render(<Dashboard />);
    const header = screen.getByTestId('dashboard-header');
    expect(header).toHaveAttribute('data-oldest', '2020');
  });
});
