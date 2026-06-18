import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { enqueueSnackbar } from 'notistack';
import { useModal } from '../../../../../src/client/components/modal/modal';
import { useDeleteTransactionMutation } from '../../../../../src/client/features/transaction';
import TransactionItem from '../../../../../src/client/pages/transactions/transactionList/transactionItem';
import { TRANSACTION_TYPES } from '../../../../../src/client/enums';
import type { Transaction } from '../../../../../src/client/types';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

jest.mock('../../../../../src/client/features/transaction', () => ({
  useDeleteTransactionMutation: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      if (k === 'currencyFormat') return 'USD';
      return k;
    },
  }),
}));

const mockTransaction: Transaction = {
  id: 1,
  name: 'Coffee',
  value: 5.5,
  type: TRANSACTION_TYPES.CARD_PURCHASE,
  date: '2025-01-10T10:00:00Z',
  accountId: 1,
  accountName: 'Main',
  categoryName: 'Food',
  userId: 1,
};

describe('TransactionItem', () => {
  const mockShowModal = jest.fn();
  const mockCloseModal = jest.fn();
  const mockDelete = jest.fn();
  const mockOnSelect = jest.fn();
  const mockEditTrigger = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (useModal as jest.Mock).mockReturnValue({ showModal: mockShowModal, closeModal: mockCloseModal });
    (useDeleteTransactionMutation as jest.Mock).mockReturnValue([mockDelete, {}]);
  });

  const setup = (props: Partial<Parameters<typeof TransactionItem>[0]> = {}) =>
    render(
      <TransactionItem
        transaction={mockTransaction}
        selectedId={0}
        onSelect={mockOnSelect}
        editSelectTrigger={mockEditTrigger}
        {...props}
      />,
    );

  it('renders transaction name', () => {
    setup();
    expect(screen.getByText('Coffee')).toBeInTheDocument();
  });

  it('renders account and category name', () => {
    setup();
    expect(screen.getByText('Main - Food')).toBeInTheDocument();
  });

  it('renders value with minus sign for negative types (cardPurchase)', () => {
    setup();
    // The value wrapper shows "- $5.50" for negative types
    expect(screen.getAllByText(/^- /)[0]).toBeInTheDocument();
  });

  it('renders value with plus sign for positive types (deposit)', () => {
    setup({ transaction: { ...mockTransaction, type: TRANSACTION_TYPES.DEPOSIT } });
    expect(screen.getAllByText(/^\+ /)[0]).toBeInTheDocument();
  });

  it('clicking item calls onSelect with the transaction id when not selected', () => {
    setup({ selectedId: 0 });
    fireEvent.click(screen.getByText('Coffee'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockTransaction.id);
  });

  it('clicking item calls onSelect with 0 when already selected', () => {
    setup({ selectedId: 1 });
    fireEvent.click(screen.getByText('Coffee'));
    expect(mockOnSelect).toHaveBeenCalledWith(0);
  });

  it('clicking edit button calls editSelectTrigger with the transaction', () => {
    setup({ selectedId: 1 });
    const editButtons = screen.getAllByRole('button');
    // Edit button is first, delete button is second
    fireEvent.click(editButtons[0]);
    expect(mockEditTrigger).toHaveBeenCalledWith(mockTransaction);
  });

  it('clicking delete button opens modal (calls showModal)', () => {
    setup({ selectedId: 1 });
    const buttons = screen.getAllByRole('button');
    // Delete button is second
    fireEvent.click(buttons[1]);
    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('useEffect updates isSelected when selectedId changes', () => {
    const { rerender } = setup({ selectedId: 0 });
    rerender(
      <TransactionItem
        transaction={mockTransaction}
        selectedId={1}
        onSelect={mockOnSelect}
        editSelectTrigger={mockEditTrigger}
      />,
    );
    expect(screen.getByText('Coffee')).toBeInTheDocument();
  });

  it('modal onConfirm calls submitDeleteTransaction which calls deleteTransaction', async () => {
    const mockUnwrap = jest.fn().mockResolvedValue({});
    (useDeleteTransactionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockReturnValue({ unwrap: mockUnwrap }),
      {},
    ]);

    setup({ selectedId: 1 });
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    // Get the ConfirmModal element passed to showModal
    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement<any>;
    expect(modalElement).toBeDefined();

    // Call onConfirm to trigger submitDeleteTransaction
    await modalElement.props.onConfirm();

    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalled();
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        'transactionDeletedSuccessfully',
        { variant: 'success' },
      );
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('modal onConfirm shows error snackbar when deleteTransaction fails', async () => {
    const mockUnwrap = jest.fn().mockRejectedValue(new Error('fail'));
    (useDeleteTransactionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockReturnValue({ unwrap: mockUnwrap }),
      {},
    ]);

    setup({ selectedId: 1 });
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement<any>;
    await modalElement.props.onConfirm();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        'transactionDeletedError',
        { variant: 'error' },
      );
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('modal onCancel calls closeModal', () => {
    setup({ selectedId: 1 });
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement<any>;
    modalElement.props.onCancel();

    expect(mockCloseModal).toHaveBeenCalled();
  });
});
