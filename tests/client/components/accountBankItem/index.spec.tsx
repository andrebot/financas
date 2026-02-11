import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { enqueueSnackbar } from 'notistack';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import AccountBankItem from '../../../../src/client/components/accountBankItem';
import ModalProvider from '../../../../src/client/components/modal/modal';
import type { BankAccount } from '../../../../src/client/types';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn().mockReturnValue({ user: { id: 'user-1' } }),
}));

jest.mock('../../../../src/client/features/bankAccount', () => ({
  useDeleteBankAccountMutation: jest.fn(),
  useUpdateBankAccountMutation: jest.fn(),
}));

jest.mock('../../../../src/client/components/creditCard', () => ({
  __esModule: true,
  default: ({ last4Digits, flag }: { last4Digits: string; flag: string }) => (
    <div data-testid="credit-card" data-flag={flag}>
      {last4Digits}
    </div>
  ),
}));

const {
  useDeleteBankAccountMutation,
  useUpdateBankAccountMutation,
} = jest.requireMock('../../../../src/client/features/bankAccount');
const { useAuth } = jest.requireMock('../../../../src/client/hooks/authContext');

const mockDeleteBankAccount = jest.fn();
const mockUpdateBankAccount = jest.fn();

describe('AccountBankItem', () => {
  const bankAccount: BankAccount = {
    id: 'account-1',
    name: 'Primary Account',
    agency: '0001',
    accountNumber: '123456',
    currency: 'BRL',
    user: 'user-1',
    cards: [
      {
        flag: 'visa',
        last4Digits: '1234',
        number: '4111111111111234',
        expirationDate: '01/25',
      },
    ],
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });
    (useDeleteBankAccountMutation as jest.Mock).mockReturnValue([
      mockDeleteBankAccount,
      { isError: false, isSuccess: false },
    ]);
    (useUpdateBankAccountMutation as jest.Mock).mockReturnValue([
      mockUpdateBankAccount,
      { isError: false, isSuccess: false },
    ]);
  });

  const renderAccountBankItem = (account: BankAccount = bankAccount) =>
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <I18nextProvider i18n={i18n}>
          <ModalProvider>
            <AccountBankItem bankAccount={account} />
          </ModalProvider>
        </I18nextProvider>
      </LocalizationProvider>
    );

  it('should render bank account name', () => {
    renderAccountBankItem();

    expect(screen.getByText('Primary Account')).toBeInTheDocument();
  });

  it('should render account number and agency with labels', () => {
    renderAccountBankItem();

    expect(screen.getByText(`${i18nEn.translation.bankAccountNumber}: 123456`)).toBeInTheDocument();
    expect(screen.getByText(`${i18nEn.translation.bankAgencyNumber}: 0001`)).toBeInTheDocument();
  });

  it('should render credit cards', () => {
    renderAccountBankItem();

    const creditCards = screen.getAllByTestId('credit-card');
    expect(creditCards).toHaveLength(1);
    expect(creditCards[0]).toHaveTextContent('1234');
    expect(creditCards[0]).toHaveAttribute('data-flag', 'visa');
  });

  it('should render multiple credit cards when provided', () => {
    const accountWithMultipleCards: BankAccount = {
      ...bankAccount,
      cards: [
        { flag: 'visa', last4Digits: '1234', number: '4111111111111234', expirationDate: '01/25' },
        { flag: 'master', last4Digits: '5678', number: '5500000000005678', expirationDate: '12/26' },
      ],
    };

    renderAccountBankItem(accountWithMultipleCards);

    const creditCards = screen.getAllByTestId('credit-card');
    expect(creditCards).toHaveLength(2);
    expect(creditCards[0]).toHaveTextContent('1234');
    expect(creditCards[1]).toHaveTextContent('5678');
  });

  it('should render action menu button', () => {
    renderAccountBankItem();

    expect(screen.getByRole('button', { name: i18nEn.translation.actionMenu })).toBeInTheDocument();
  });

  it('should open menu and show Edit and Delete options when action button is clicked', () => {
    renderAccountBankItem();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.actionMenu }));

    expect(screen.getByRole('menuitem', { name: i18nEn.translation.edit })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: i18nEn.translation.delete })).toBeInTheDocument();
  });

  it('should open update modal when Edit is clicked', () => {
    renderAccountBankItem();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.actionMenu }));
    fireEvent.click(screen.getByRole('menuitem', { name: i18nEn.translation.edit }));

    expect(screen.getByText(i18nEn.translation.addBankAccount)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.name)).toBeInTheDocument();
  });

  it('should call updateBankAccount and close modal when Save is clicked in edit modal', async () => {
    renderAccountBankItem();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.actionMenu }));
    fireEvent.click(screen.getByRole('menuitem', { name: i18nEn.translation.edit }));

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateBankAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Primary Account',
          currency: 'BRL',
          accountNumber: '123456',
          agency: '0001',
          id: 'account-1',
          user: 'user-1',
          cards: bankAccount.cards,
        })
      );
    });
    expect(screen.queryByText(i18nEn.translation.addBankAccount)).not.toBeInTheDocument();
  });

  it('should open confirm delete modal when Delete is clicked', () => {
    renderAccountBankItem();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.actionMenu }));
    fireEvent.click(screen.getByRole('menuitem', { name: i18nEn.translation.delete }));

    expect(screen.getByRole('heading', { name: i18nEn.translation.bankAccountDeletionTitle })).toBeInTheDocument();
    expect(screen.getByText(i18nEn.translation.bankAccountDeletionDescription)).toBeInTheDocument();
  });

  it('should call deleteBankAccount when Confirm is clicked in delete modal', async () => {
    renderAccountBankItem();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.actionMenu }));
    fireEvent.click(screen.getByRole('menuitem', { name: i18nEn.translation.delete }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockDeleteBankAccount).toHaveBeenCalledWith('account-1');
  });

  it('should show success snackbar when delete succeeds', async () => {
    (useDeleteBankAccountMutation as jest.Mock).mockReturnValue([
      mockDeleteBankAccount,
      { isError: false, isSuccess: true },
    ]);

    renderAccountBankItem();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.bankAccountDeleted, { variant: 'success' });
    });
  });

  it('should show error snackbar when delete fails', async () => {
    (useDeleteBankAccountMutation as jest.Mock).mockReturnValue([
      mockDeleteBankAccount,
      { isError: true, isSuccess: false },
    ]);

    renderAccountBankItem();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(expect.any(String), { variant: 'error' });
    });
  });

  it('should show success snackbar when update succeeds', async () => {
    (useUpdateBankAccountMutation as jest.Mock).mockReturnValue([
      mockUpdateBankAccount,
      { isError: false, isSuccess: true },
    ]);

    renderAccountBankItem();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.bankAccountUpdated, { variant: 'success' });
    });
  });

  it('should show error snackbar when update fails', async () => {
    (useUpdateBankAccountMutation as jest.Mock).mockReturnValue([
      mockUpdateBankAccount,
      { isError: true, isSuccess: false },
    ]);

    renderAccountBankItem();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.bankAccountUpdateFailed, { variant: 'error' });
    });
  });

  it('should render empty cards list when no cards', () => {
    renderAccountBankItem({ ...bankAccount, cards: [] });

    expect(screen.queryAllByTestId('credit-card')).toHaveLength(0);
  });
});
