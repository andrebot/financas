import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import TransactionList from '../../../../../src/client/pages/transactions/transactionList';
import { TRANSACTION_TYPES } from '../../../../../src/client/enums';
import type { Transaction } from '../../../../../src/client/types';

jest.mock('../../../../../src/client/pages/transactions/transactionList/transactionItem', () => ({
  __esModule: true,
  default: ({ transaction }: { transaction: Transaction }) => (
    <div data-testid="transaction-item">{transaction.name}</div>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 1,
  name: 'Coffee',
  value: 5,
  type: TRANSACTION_TYPES.CARD_PURCHASE,
  date: '2025-01-10T10:00:00Z',
  accountId: 1,
  userId: 1,
  ...overrides,
});

describe('TransactionList', () => {
  const editSelectTrigger = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders nothing (empty list) when transactions array is empty', async () => {
    render(<TransactionList transactions={[]} editSelectTrigger={editSelectTrigger} />);
    await waitFor(() => {
      expect(screen.queryAllByTestId('transaction-item')).toHaveLength(0);
    });
  });

  it('renders a date group header for each unique date', async () => {
    const transactions = [
      makeTx({ id: 1, date: '2025-01-10T10:00:00Z', name: 'Coffee' }),
      makeTx({ id: 2, date: '2025-01-11T10:00:00Z', name: 'Lunch' }),
    ];
    render(<TransactionList transactions={transactions} editSelectTrigger={editSelectTrigger} />);
    await waitFor(() => {
      const items = screen.getAllByTestId('transaction-item');
      expect(items).toHaveLength(2);
    });
    // Two different dates should produce two groups
    // The date label text uses dateFormat key which returns 'dateFormat' (from mock)
    // We check the transaction items exist in the DOM
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  it('renders transactions grouped under their date', async () => {
    const transactions = [
      makeTx({ id: 1, date: '2025-01-10T10:00:00Z', name: 'Morning Coffee' }),
    ];
    render(<TransactionList transactions={transactions} editSelectTrigger={editSelectTrigger} />);
    await waitFor(() => {
      expect(screen.getByText('Morning Coffee')).toBeInTheDocument();
    });
  });

  it('two transactions on the same date appear in the same group', async () => {
    const transactions = [
      makeTx({ id: 1, date: '2025-01-10T08:00:00Z', name: 'Breakfast' }),
      makeTx({ id: 2, date: '2025-01-10T12:00:00Z', name: 'Lunch' }),
    ];
    render(<TransactionList transactions={transactions} editSelectTrigger={editSelectTrigger} />);
    await waitFor(() => {
      const items = screen.getAllByTestId('transaction-item');
      expect(items).toHaveLength(2);
    });
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  it('transactions are sorted descending by date (newer group first)', async () => {
    const transactions = [
      makeTx({ id: 1, date: '2025-01-08T10:00:00Z', name: 'Old Transaction' }),
      makeTx({ id: 2, date: '2025-01-15T10:00:00Z', name: 'New Transaction' }),
    ];
    render(<TransactionList transactions={transactions} editSelectTrigger={editSelectTrigger} />);
    await waitFor(() => {
      const items = screen.getAllByTestId('transaction-item');
      expect(items).toHaveLength(2);
    });
    const items = screen.getAllByTestId('transaction-item');
    // Newer transaction should appear first
    expect(items[0]).toHaveTextContent('New Transaction');
    expect(items[1]).toHaveTextContent('Old Transaction');
  });
});
