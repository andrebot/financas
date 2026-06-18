import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useListTransactionsQuery } from '../../../../../../src/client/features/transaction';
import { useListBankAccountsQuery } from '../../../../../../src/client/features/bankAccount';
import CreditCardBalances from '../../../../../../src/client/pages/transactions/dashboard/creditCardBalances';
import { TRANSACTION_TYPES } from '../../../../../../src/client/enums';

jest.mock('../../../../../../src/client/features/transaction', () => ({
  useListTransactionsQuery: jest.fn(),
}));

jest.mock('../../../../../../src/client/features/bankAccount', () => ({
  useListBankAccountsQuery: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      if (k === 'currencyFormat') return 'USD';
      return k;
    },
  }),
}));

describe('CreditCardBalances', () => {
  // Billing cycle for closingDay=15, selectedMonth=0 (Jan), selectedYear=2025:
  // cycleEnd = Jan 15, 2025
  // cycleStart = Dec 16, 2024
  const defaultProps = { selectedYear: 2025, selectedMonth: 0 };

  const mockBankAccounts = [
    {
      id: '1',
      name: 'Main Account',
      cards: [{ id: 1, number: '4111111111111111', closingDay: 15 }],
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({ data: mockBankAccounts });
    (useListTransactionsQuery as jest.Mock).mockReturnValue({ data: [] });
  });

  it('shows "noCardTransactions" when no transactions have a cardId', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Cash Withdrawal',
          value: 100,
          type: TRANSACTION_TYPES.WITHDRAW,
          date: '2025-01-10T10:00:00Z',
          accountId: 1,
          userId: 1,
          // no cardId
        },
      ],
    });

    render(<CreditCardBalances {...defaultProps} />);
    expect(screen.getByText('noCardTransactions')).toBeInTheDocument();
  });

  it('renders a card entry when a transaction falls within the billing cycle', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Coffee',
          value: 5.5,
          type: TRANSACTION_TYPES.CARD_PURCHASE,
          date: '2025-01-10T10:00:00Z', // Jan 10 is within Dec 16 – Jan 15
          accountId: 1,
          cardId: 1,
          userId: 1,
        },
      ],
    });

    render(<CreditCardBalances {...defaultProps} />);
    // Label format: "Account Name - last4"
    expect(screen.getByText('Main Account - 1111')).toBeInTheDocument();
    expect(screen.queryByText('noCardTransactions')).not.toBeInTheDocument();
  });

  it('label format is "Account Name - last4"', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Lunch',
          value: 12,
          type: TRANSACTION_TYPES.CARD_PURCHASE,
          date: '2025-01-05T12:00:00Z',
          accountId: 1,
          cardId: 1,
          userId: 1,
        },
      ],
    });

    render(<CreditCardBalances {...defaultProps} />);
    expect(screen.getByText('Main Account - 1111')).toBeInTheDocument();
  });

  it('transaction outside the billing cycle is not counted (before cycleStart)', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Old Purchase',
          value: 20,
          type: TRANSACTION_TYPES.CARD_PURCHASE,
          date: '2024-12-15T10:00:00Z', // Dec 15 is before cycleStart (Dec 16)
          accountId: 1,
          cardId: 1,
          userId: 1,
        },
      ],
    });

    render(<CreditCardBalances {...defaultProps} />);
    expect(screen.getByText('noCardTransactions')).toBeInTheDocument();
  });

  it('transaction after cycleEnd is not counted', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Late Purchase',
          value: 30,
          type: TRANSACTION_TYPES.CARD_PURCHASE,
          date: '2025-01-20T10:00:00Z', // Jan 20 is after cycleEnd (Jan 15)
          accountId: 1,
          cardId: 1,
          userId: 1,
        },
      ],
    });

    render(<CreditCardBalances {...defaultProps} />);
    expect(screen.getByText('noCardTransactions')).toBeInTheDocument();
  });

  it('transaction on the day of cycleEnd is included', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Last Day Purchase',
          value: 10,
          type: TRANSACTION_TYPES.CARD_PURCHASE,
          date: '2025-01-15T08:00:00Z', // Jan 15 = cycleEnd day
          accountId: 1,
          cardId: 1,
          userId: 1,
        },
      ],
    });

    render(<CreditCardBalances {...defaultProps} />);
    expect(screen.getByText('Main Account - 1111')).toBeInTheDocument();
  });

  it('handles account with no cards (cards is undefined)', () => {
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({
      data: [{ id: '1', name: 'No Cards Account', cards: undefined }],
    });
    (useListTransactionsQuery as jest.Mock).mockReturnValue({ data: [] });

    render(<CreditCardBalances {...defaultProps} />);
    expect(screen.getByText('noCardTransactions')).toBeInTheDocument();
  });

  it('ignores transaction when cardId is not found in cardInfoMap', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Unknown Card Purchase',
          value: 50,
          type: TRANSACTION_TYPES.CARD_PURCHASE,
          date: '2025-01-10T10:00:00Z',
          accountId: 1,
          cardId: 999,
          userId: 1,
        },
      ],
    });

    render(<CreditCardBalances {...defaultProps} />);
    expect(screen.getByText('noCardTransactions')).toBeInTheDocument();
  });

  it('uses empty array defaults when query data is undefined', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({});
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({});

    render(<CreditCardBalances {...defaultProps} />);
    expect(screen.getByText('noCardTransactions')).toBeInTheDocument();
  });

  it('sums multiple transactions for the same card', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Coffee',
          value: 5,
          type: TRANSACTION_TYPES.CARD_PURCHASE,
          date: '2025-01-05T10:00:00Z',
          accountId: 1,
          cardId: 1,
          userId: 1,
        },
        {
          id: 2,
          name: 'Lunch',
          value: 15,
          type: TRANSACTION_TYPES.CARD_PURCHASE,
          date: '2025-01-10T12:00:00Z',
          accountId: 1,
          cardId: 1,
          userId: 1,
        },
      ],
    });

    render(<CreditCardBalances {...defaultProps} />);
    // Total is 20 (5 + 15); formatted as currency
    expect(screen.getByText(/20/)).toBeInTheDocument();
    // Only one card entry should be rendered
    expect(screen.getAllByText('Main Account - 1111').length).toBe(1);
  });
});
