import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useListBankAccountsQuery } from '../../../../../../src/client/features/bankAccount';
import { useListMonthlyBalancesQuery } from '../../../../../../src/client/features/monthlyBalance';
import BankAccountBalances from '../../../../../../src/client/pages/transactions/dashboard/bankAccountBalances';

jest.mock('../../../../../../src/client/features/bankAccount', () => ({
  useListBankAccountsQuery: jest.fn(),
}));

jest.mock('../../../../../../src/client/features/monthlyBalance', () => ({
  useListMonthlyBalancesQuery: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      if (k === 'currencyFormat') return 'USD';
      return k;
    },
  }),
}));

describe('BankAccountBalances', () => {
  const defaultProps = { selectedYear: 2025, selectedMonth: 0 };

  const mockBankAccounts = [
    { id: '1', name: 'Checking Account' },
    { id: '2', name: 'Savings Account' },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({ data: mockBankAccounts });
    (useListMonthlyBalancesQuery as jest.Mock).mockReturnValue({ data: [] });
  });

  it('renders bank account names', () => {
    render(<BankAccountBalances {...defaultProps} />);
    expect(screen.getByText('Checking Account')).toBeInTheDocument();
    expect(screen.getByText('Savings Account')).toBeInTheDocument();
  });

  it('shows "—" when no monthly balance exists for an account', () => {
    render(<BankAccountBalances {...defaultProps} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBe(2);
  });

  it('shows formatted balance when a monthly balance exists (positive)', () => {
    (useListMonthlyBalancesQuery as jest.Mock).mockReturnValue({
      data: [{ accountId: 1, closingBalance: 1500.5 }],
    });
    render(<BankAccountBalances {...defaultProps} />);
    // Balance is formatted, USD format: $1,500.50
    expect(screen.getByText(/1.500/)).toBeInTheDocument();
    // The second account still shows —
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows formatted balance when balance is negative', () => {
    (useListMonthlyBalancesQuery as jest.Mock).mockReturnValue({
      data: [{ accountId: 1, closingBalance: -250 }],
    });
    render(<BankAccountBalances {...defaultProps} />);
    // Should show negative value
    expect(screen.getByText(/250/)).toBeInTheDocument();
  });

  it('passes year and month+1 to the monthly balance query', () => {
    render(<BankAccountBalances selectedYear={2025} selectedMonth={2} />);
    expect(useListMonthlyBalancesQuery).toHaveBeenCalledWith({ year: 2025, month: 3 });
  });

  it('uses empty array defaults when query data is undefined', () => {
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({});
    (useListMonthlyBalancesQuery as jest.Mock).mockReturnValue({});
    expect(() => render(<BankAccountBalances {...defaultProps} />)).not.toThrow();
  });
});
