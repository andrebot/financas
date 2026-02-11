import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import AddBankAccountModal from '../../../../src/client/pages/bankAccounts/addBankAccountModal';
import { useModal } from '../../../../src/client/components/modal/modal';
import { useAuth } from '../../../../src/client/hooks/authContext';
import CreditCardForm from '../../../../src/client/pages/bankAccounts/creditCardForm';

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/pages/bankAccounts/creditCardForm', () => jest.fn(() => <div>CreditCardForm</div>));

describe('AddBankAccountModal', () => {
  const mockCloseModal = jest.fn();
  const mockSaveBankAccount = jest.fn();
  const mockUser = { id: 'user-1' };

  beforeEach(() => {
    jest.resetAllMocks();
    (useModal as jest.Mock).mockReturnValue({ closeModal: mockCloseModal });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  const setup = () =>
    render(
      <I18nextProvider i18n={i18n}>
        <AddBankAccountModal saveBankAccount={mockSaveBankAccount} />
      </I18nextProvider>
    );

  it('renders modal fields and buttons', () => {
    setup();

    expect(screen.getByText(/add bank account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.name)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.currency)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.bankAccountNumber)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.bankAgencyNumber)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(CreditCardForm).toHaveBeenCalled();
  });

  it('allows filling form and saving bank account', () => {
    setup();

    fireEvent.change(screen.getByLabelText(i18nEn.translation.name), { target: { value: 'My account' } });
    fireEvent.mouseDown(screen.getByLabelText(i18nEn.translation.currency));
    const option = screen.getByRole('option', { name: /brl/i });
    fireEvent.click(option);

    fireEvent.change(screen.getByLabelText(i18nEn.translation.bankAccountNumber), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(i18nEn.translation.bankAgencyNumber), { target: { value: '9876' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockSaveBankAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My account',
        currency: 'BRL',
        accountNumber: '123456',
        agency: '9876',
        user: mockUser.id,
      })
    );
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('closes modal when cancel is clicked', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockCloseModal).toHaveBeenCalled();
  });
});

