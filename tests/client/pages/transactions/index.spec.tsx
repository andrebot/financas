import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { useListTransactionsQuery } from '../../../../src/client/features/transaction';
import Transactions from '../../../../src/client/pages/transactions';
import type { Transaction } from '../../../../src/client/types';
import { TRANSACTION_TYPES } from '../../../../src/client/enums';

jest.mock('../../../../src/client/features/transaction', () => ({
  useListTransactionsQuery: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

// Mock child components with test ids, passing through key props for interaction tests
jest.mock('../../../../src/client/pages/transactions/transactionList', () => ({
  __esModule: true,
  default: ({ editSelectTrigger }: { editSelectTrigger: (t: Transaction | undefined) => void }) => (
    <button
      data-testid="transaction-list"
      onClick={() =>
        editSelectTrigger({
          id: 1,
          name: 'Test Transaction',
          value: 10,
          type: TRANSACTION_TYPES.DEPOSIT,
          date: '2025-01-10T10:00:00Z',
          accountId: 1,
          userId: 1,
        })
      }
    >
      transaction-list
    </button>
  ),
}));

jest.mock('../../../../src/client/pages/transactions/addTransactionForm', () => ({
  __esModule: true,
  default: ({ onCancel }: { onCancel: () => void }) => (
    <button data-testid="add-form" onClick={onCancel}>
      add-form
    </button>
  ),
}));

jest.mock('../../../../src/client/pages/transactions/dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard" />,
}));

describe('Transactions page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useListTransactionsQuery as jest.Mock).mockReturnValue({ data: [] });
  });

  const setup = () => render(<Transactions />);

  it('renders dashboard by default', () => {
    setup();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('does NOT render add form by default', () => {
    setup();
    expect(screen.queryByTestId('add-form')).not.toBeInTheDocument();
  });

  it('clicking Add button shows the add form', () => {
    setup();
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    expect(screen.getByTestId('add-form')).toBeInTheDocument();
  });

  it('clicking Add button hides the dashboard', () => {
    setup();
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  it('when editSelectTrigger is called via TransactionList, shows add form', () => {
    setup();
    // TransactionList mock fires editSelectTrigger when clicked
    const listButton = screen.getByTestId('transaction-list');
    fireEvent.click(listButton);
    expect(screen.getByTestId('add-form')).toBeInTheDocument();
  });

  it('uses empty array default when transactions data is undefined', () => {
    (useListTransactionsQuery as jest.Mock).mockReturnValue({});
    expect(() => setup()).not.toThrow();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('when onCancel is called from AddTransactionForm, shows dashboard again', () => {
    setup();
    // Navigate to add form first
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByTestId('add-form')).toBeInTheDocument();

    // Click the cancel button in the mocked add form
    fireEvent.click(screen.getByTestId('add-form'));
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('add-form')).not.toBeInTheDocument();
  });
});
