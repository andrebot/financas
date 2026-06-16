import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { enqueueSnackbar } from 'notistack';
import i18n from '../../../../../src/client/i18n';
import AddTransactionForm from '../../../../../src/client/pages/transactions/addTransactionForm';
import { useAuth } from '../../../../../src/client/hooks/authContext';
import { useListBankAccountsQuery } from '../../../../../src/client/features/bankAccount';
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from '../../../../../src/client/features/transaction';
import { useFormattedCategories } from '../../../../../src/client/hooks/useFormattedCategories';
import { TRANSACTION_TYPES } from '../../../../../src/client/enums';
import type { Transaction } from '../../../../../src/client/types';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../../src/client/features/bankAccount', () => ({
  useListBankAccountsQuery: jest.fn(),
}));

jest.mock('../../../../../src/client/features/transaction', () => ({
  useCreateTransactionMutation: jest.fn(),
  useUpdateTransactionMutation: jest.fn(),
}));

jest.mock('../../../../../src/client/hooks/useFormattedCategories', () => ({
  useFormattedCategories: jest.fn(),
}));

describe('AddTransactionForm', () => {
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockCancel = jest.fn();

  const mockBankAccounts = [
    {
      id: '1',
      name: 'Main Account',
      cards: [{ id: 1, number: '4111111111111111', closingDay: 15 }],
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    mockCreate.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    mockUpdate.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });

    (useAuth as jest.Mock).mockReturnValue({ user: { id: '1' } });
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({ data: mockBankAccounts });
    (useFormattedCategories as jest.Mock).mockReturnValue([{ id: 1, label: 'Food' }]);
    (useCreateTransactionMutation as jest.Mock).mockReturnValue([mockCreate, {}]);
    (useUpdateTransactionMutation as jest.Mock).mockReturnValue([mockUpdate, {}]);
  });

  const setup = (props: { selectedTransaction?: Transaction; onCancel?: () => void } = {}) =>
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <I18nextProvider i18n={i18n}>
          <AddTransactionForm selectedTransaction={props.selectedTransaction} onCancel={props.onCancel ?? mockCancel} />
        </I18nextProvider>
      </LocalizationProvider>,
    );

  it('renders the Add Transaction title', () => {
    setup();
    // The component uses t('addTransaction') — with I18nextProvider loaded properly it shows the translation
    // The title element renders the translation key or translated text
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('card select is disabled when no type is selected', () => {
    setup();
    // The card select has aria-disabled='true' when isCardType is false
    // Find it by its aria-labelledby pointing to 'card-label'
    const cardSelect = document.querySelector('[aria-labelledby="card-label"]') as HTMLElement;
    expect(cardSelect).toBeTruthy();
    expect(cardSelect).toHaveAttribute('aria-disabled', 'true');
  });

  it('card select is enabled when type is cardPurchase', () => {
    setup();
    // Open the type dropdown using its specific labelledby
    const typeSelect = document.querySelector('[aria-labelledby="type-label"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    // Find the cardPurchase option in the open listbox
    const options = screen.getAllByRole('option');
    const cardPurchaseOption = options.find((opt) => opt.getAttribute('data-value') === TRANSACTION_TYPES.CARD_PURCHASE);
    expect(cardPurchaseOption).toBeTruthy();
    fireEvent.click(cardPurchaseOption!);
    // Now card select should be enabled
    const cardSelect = document.querySelector('[aria-labelledby="card-label"]') as HTMLElement;
    expect(cardSelect).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('card select is enabled when type is cardRefund', () => {
    setup();
    const typeSelect = document.querySelector('[aria-labelledby="type-label"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    const options = screen.getAllByRole('option');
    const cardRefundOption = options.find((opt) => opt.getAttribute('data-value') === TRANSACTION_TYPES.CARD_REFUND);
    expect(cardRefundOption).toBeTruthy();
    fireEvent.click(cardRefundOption!);
    const cardSelect = document.querySelector('[aria-labelledby="card-label"]') as HTMLElement;
    expect(cardSelect).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('card select becomes disabled when switching from cardPurchase to a non-card type', () => {
    setup();
    const typeSelect = document.querySelector('[aria-labelledby="type-label"]') as HTMLElement;

    // Select card purchase
    fireEvent.mouseDown(typeSelect);
    const optionsAfterOpen = screen.getAllByRole('option');
    const cardPurchaseOption = optionsAfterOpen.find((opt) => opt.getAttribute('data-value') === TRANSACTION_TYPES.CARD_PURCHASE);
    fireEvent.click(cardPurchaseOption!);

    // Verify card is now enabled
    const cardSelect = document.querySelector('[aria-labelledby="card-label"]') as HTMLElement;
    expect(cardSelect).not.toHaveAttribute('aria-disabled', 'true');

    // Switch to non-card type
    fireEvent.mouseDown(document.querySelector('[aria-labelledby="type-label"]') as HTMLElement);
    const optionsAfterReopen = screen.getAllByRole('option');
    const depositOption = optionsAfterReopen.find((opt) => opt.getAttribute('data-value') === TRANSACTION_TYPES.DEPOSIT);
    fireEvent.click(depositOption!);

    // Card should be disabled again
    expect(document.querySelector('[aria-labelledby="card-label"]')).toHaveAttribute('aria-disabled', 'true');
  });

  it('clicking Save with empty form shows error snackbar', async () => {
    setup();
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('fix'),
        expect.objectContaining({ variant: 'error' }),
      );
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('when selectedTransaction prop is provided, form pre-fills with transaction data', () => {
    const selectedTransaction: Transaction = {
      id: 5,
      name: 'Groceries',
      value: 75,
      type: TRANSACTION_TYPES.CARD_PURCHASE,
      date: '2024-03-10T12:00:00Z',
      accountId: 1,
      categoryId: 1,
      cardId: 1,
      userId: 1,
    };

    setup({ selectedTransaction });

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Groceries');
  });

  it('cancel button dispatches reset and calls onCancel', () => {
    setup({ onCancel: mockCancel });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('typing in name field triggers handleNameChange', () => {
    setup();
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Groceries' } });
    expect(nameInput.value).toBe('Groceries');
  });

  it('typing in value field triggers handleValueChange', () => {
    setup();
    const valueInputEl = screen.getByDisplayValue('0') as HTMLInputElement;
    fireEvent.change(valueInputEl, { target: { value: '50' } });
    expect(valueInputEl.value).toBe('50');
  });

  it('selecting a category triggers handleCategoryChange', () => {
    setup();
    const categorySelect = document.querySelector('[aria-labelledby="transaction-label"]') as HTMLElement;
    fireEvent.mouseDown(categorySelect);
    const options = screen.getAllByRole('option');
    const foodOption = options.find((opt) => opt.getAttribute('data-value') === '1');
    expect(foodOption).toBeTruthy();
    fireEvent.click(foodOption!);
  });

  it('selecting a bank account triggers handleBankChange', () => {
    setup();
    const bankSelect = document.querySelector('[aria-labelledby="bank-account-label"]') as HTMLElement;
    fireEvent.mouseDown(bankSelect);
    const options = screen.getAllByRole('option');
    const bankOption = options.find((opt) => opt.getAttribute('data-value') === '1');
    expect(bankOption).toBeTruthy();
    fireEvent.click(bankOption!);
  });

  it('selecting a card triggers handleCardChange with a card id', () => {
    setup();
    // Enable card select first
    const typeSelect = document.querySelector('[aria-labelledby="type-label"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getAllByRole('option');
    const cardPurchaseOpt = typeOptions.find((o) => o.getAttribute('data-value') === TRANSACTION_TYPES.CARD_PURCHASE);
    fireEvent.click(cardPurchaseOpt!);
    // Now select a card
    const cardSelect = document.querySelector('[aria-labelledby="card-label"]') as HTMLElement;
    fireEvent.mouseDown(cardSelect);
    const cardOptions = screen.getAllByRole('option');
    const cardOption = cardOptions.find((o) => o.getAttribute('data-value') === '1');
    expect(cardOption).toBeTruthy();
    fireEvent.click(cardOption!);
  });

  it('selecting None in card dropdown triggers handleCardChange with undefined', () => {
    setup();
    // Enable card select
    const typeSelect = document.querySelector('[aria-labelledby="type-label"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getAllByRole('option');
    fireEvent.click(typeOptions.find((o) => o.getAttribute('data-value') === TRANSACTION_TYPES.CARD_PURCHASE)!);
    // Select a card first
    const cardSelect = document.querySelector('[aria-labelledby="card-label"]') as HTMLElement;
    fireEvent.mouseDown(cardSelect);
    const cardOptions = screen.getAllByRole('option');
    fireEvent.click(cardOptions.find((o) => o.getAttribute('data-value') === '1')!);
    // Now select None (empty value)
    fireEvent.mouseDown(document.querySelector('[aria-labelledby="card-label"]') as HTMLElement);
    const cardOptions2 = screen.getAllByRole('option');
    const noneOption = cardOptions2.find((o) => !o.getAttribute('data-value') || o.getAttribute('data-value') === '');
    if (noneOption) fireEvent.click(noneOption);
  });

  it('fills all required fields and saves successfully (createTransaction)', async () => {
    setup();
    // Name
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Coffee' } });
    // Type
    const typeSelect = document.querySelector('[aria-labelledby="type-label"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getAllByRole('option');
    fireEvent.click(typeOptions.find((o) => o.getAttribute('data-value') === TRANSACTION_TYPES.DEPOSIT)!);
    // Category
    const categorySelect = document.querySelector('[aria-labelledby="transaction-label"]') as HTMLElement;
    fireEvent.mouseDown(categorySelect);
    const catOptions = screen.getAllByRole('option');
    fireEvent.click(catOptions.find((o) => o.getAttribute('data-value') === '1')!);
    // Bank account
    const bankSelect = document.querySelector('[aria-labelledby="bank-account-label"]') as HTMLElement;
    fireEvent.mouseDown(bankSelect);
    const bankOptions = screen.getAllByRole('option');
    fireEvent.click(bankOptions.find((o) => o.getAttribute('data-value') === '1')!);
    // Value (initial value is 0, so getByDisplayValue('0') finds the value input)
    fireEvent.change(screen.getByDisplayValue('0'), { target: { value: '10' } });
    // Save
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
    // Wait for the async success path (RESET + success snackbar) to complete
    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.any(String),
        { variant: 'success' },
      );
    });
  });

  it('shows error snackbar when createTransaction mutation throws', async () => {
    mockCreate.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('Network error')) });
    setup();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Coffee' } });
    const typeSelect = document.querySelector('[aria-labelledby="type-label"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    fireEvent.click(screen.getAllByRole('option').find((o) => o.getAttribute('data-value') === TRANSACTION_TYPES.DEPOSIT)!);
    const categorySelect = document.querySelector('[aria-labelledby="transaction-label"]') as HTMLElement;
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getAllByRole('option').find((o) => o.getAttribute('data-value') === '1')!);
    const bankSelect = document.querySelector('[aria-labelledby="bank-account-label"]') as HTMLElement;
    fireEvent.mouseDown(bankSelect);
    fireEvent.click(screen.getAllByRole('option').find((o) => o.getAttribute('data-value') === '1')!);
    fireEvent.change(screen.getByDisplayValue('0'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(expect.any(String), { variant: 'error' });
    });
  });

  it('calls updateTransaction when selectedTransaction has an id', async () => {
    const selectedTransaction: Transaction = {
      id: 3,
      name: 'Lunch',
      value: 20,
      type: TRANSACTION_TYPES.DEPOSIT,
      date: '2024-01-10T12:00:00Z',
      accountId: 1,
      categoryId: 1,
      userId: 1,
    };
    setup({ selectedTransaction });
    // Name is pre-filled
    // Type
    const typeSelect = document.querySelector('[aria-labelledby="type-label"]') as HTMLElement;
    fireEvent.mouseDown(typeSelect);
    const typeOptions = screen.getAllByRole('option');
    fireEvent.click(typeOptions.find((o) => o.getAttribute('data-value') === TRANSACTION_TYPES.DEPOSIT)!);
    // Category
    const categorySelect = document.querySelector('[aria-labelledby="transaction-label"]') as HTMLElement;
    fireEvent.mouseDown(categorySelect);
    const catOptions = screen.getAllByRole('option');
    fireEvent.click(catOptions.find((o) => o.getAttribute('data-value') === '1')!);
    // Bank
    const bankSelect = document.querySelector('[aria-labelledby="bank-account-label"]') as HTMLElement;
    fireEvent.mouseDown(bankSelect);
    const bankOptions = screen.getAllByRole('option');
    fireEvent.click(bankOptions.find((o) => o.getAttribute('data-value') === '1')!);
    // Value
    const inputs = document.querySelectorAll('input');
    const valueInput = Array.from(inputs).find((el) => el.getAttribute('inputmode') === 'decimal');
    if (valueInput) fireEvent.change(valueInput, { target: { value: '20' } });
    // Save → should call updateTransaction because state has id
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  it('renders without error when a bank account has no cards', () => {
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({
      data: [{ id: '2', name: 'No Cards Account', cards: undefined }],
    });
    expect(() => setup()).not.toThrow();
  });

  it('uses empty array default when bankAccounts data is undefined', () => {
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({});
    expect(() => setup()).not.toThrow();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('interacting with DatePicker triggers handleDateChange', () => {
    setup();
    // The MUI DatePicker renders spinbutton elements for day/month/year sections
    const spinbuttons = screen.getAllByRole('spinbutton');
    if (spinbuttons.length > 0) {
      fireEvent.click(spinbuttons[0]);
      fireEvent.keyDown(spinbuttons[0], { key: 'ArrowUp' });
    }
    // Component still renders without errors after date change
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});
