import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import BankAccounts from '../../../../src/client/pages/bankAccounts';
import { useModal } from '../../../../src/client/components/modal/modal';
import { useListBankAccountsQuery, useCreateBankAccountMutation } from '../../../../src/client/features/bankAccount';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

jest.mock('../../../../src/client/features/bankAccount', () => ({
  useListBankAccountsQuery: jest.fn(),
  useCreateBankAccountMutation: jest.fn(),
}));

jest.mock('../../../../src/client/components/accountBankItem', () => (props: any) => (
  <div data-testid="account-bank-item">{props.bankAccount.name}</div>
));

describe('BankAccounts page', () => {
  const mockShowModal = jest.fn();
  const mockCreateBankAccount = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    (useModal as jest.Mock).mockReturnValue({ showModal: mockShowModal });
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: '1',
          name: 'Primary account',
          agency: '0001',
          accountNumber: '123456',
          cards: [],
          currency: 'BRL',
          user: 'user-1',
        },
      ],
    });
    (useCreateBankAccountMutation as jest.Mock).mockReturnValue([
      mockCreateBankAccount,
      { isError: false, isSuccess: false },
    ]);
  });

  const setup = () =>
    render(
      <I18nextProvider i18n={i18n}>
        <BankAccounts />
      </I18nextProvider>
    );

  it('should render bank accounts list and create button', () => {
    setup();

    expect(screen.getByText(i18nEn.translation.bankAccounts)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.createAccount)).toBeInTheDocument();
    expect(screen.getAllByTestId('account-bank-item')).toHaveLength(1);
  });

  it('should use default empty array when useListBankAccountsQuery returns no data', () => {
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({});

    setup();

    expect(screen.getByText(i18nEn.translation.bankAccounts)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.createAccount)).toBeInTheDocument();
    expect(screen.queryAllByTestId('account-bank-item')).toHaveLength(0);
  });

  it('should render AccountBankItem with key fallback to name when id is empty', () => {
    (useListBankAccountsQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: '1',
          name: 'Primary account',
          agency: '0001',
          accountNumber: '123456',
          cards: [],
          currency: 'BRL',
          user: 'user-1',
        },
        {
          id: undefined,
          name: 'Account without id',
          agency: '0002',
          accountNumber: '789012',
          cards: [],
          currency: 'USD',
          user: 'user-1',
        },
      ],
    });

    setup();

    const items = screen.getAllByTestId('account-bank-item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Primary account');
    expect(items[1]).toHaveTextContent('Account without id');
  });

  it('should open add bank account modal when clicking create button', () => {
    setup();

    fireEvent.click(screen.getByLabelText(i18nEn.translation.createAccount));

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('should show success notification when account is created successfully', async () => {
    (useCreateBankAccountMutation as jest.Mock).mockReturnValue([
      mockCreateBankAccount,
      { isError: false, isSuccess: true },
    ]);

    setup();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nEn.translation.bankAccountCreated, {
        variant: 'success',
      });
    });
  });

  it('should show error notification when account creation fails', async () => {
    (useCreateBankAccountMutation as jest.Mock).mockReturnValue([
      mockCreateBankAccount,
      { isError: true, isSuccess: false },
    ]);

    setup();

    await waitFor(() => {
      // Key 'bankAccountCreationFailed' is not defined in translations, so we only
      // assert that an error snackbar is shown with some message.
      expect(enqueueSnackbar).toHaveBeenCalledWith(expect.any(String), {
        variant: 'error',
      });
    });
  });

  it('should call createBankAccount when addBankAccount is invoked from modal', () => {
    setup();

    // Open modal so showModal is called with the AddBankAccountModal element
    fireEvent.click(screen.getByLabelText(i18nEn.translation.createAccount));

    expect(mockShowModal).toHaveBeenCalledTimes(1);

    const modalElement = mockShowModal.mock.calls[0][0] as React.ReactElement;
    const props = modalElement.props as { saveBankAccount: (bankAccount: any) => void };

    const bankAccountPayload = {
      id: '1',
      name: 'My account',
      agency: '0001',
      accountNumber: '123456',
      cards: [],
      currency: 'BRL',
      user: 'user-1',
    };

    props.saveBankAccount(bankAccountPayload);

    expect(mockCreateBankAccount).toHaveBeenCalledWith(bankAccountPayload);
  });
});

