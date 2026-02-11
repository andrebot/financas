import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import CreditCardForm from '../../../../src/client/pages/bankAccounts/creditCardForm';
import { detectCardBrand, formatExpirationDate } from '../../../../src/client/utils/creditCard';
import type { CreditCardProps } from '../../../../src/client/types';

jest.mock('../../../../src/client/utils/creditCard', () => ({
  ...jest.requireActual('../../../../src/client/utils/creditCard'),
  detectCardBrand: jest.fn(),
  formatExpirationDate: jest.fn(),
}));

describe('CreditCardForm', () => {
  let mockSetCreditCards: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockSetCreditCards = jest.fn();
    (detectCardBrand as jest.Mock).mockReturnValue('visa');
    (formatExpirationDate as jest.Mock).mockImplementation((date: Date | undefined) =>
      date ? dayjs(date).format('MM/YY') : ''
    );
  });

  const setup = (initialCards: CreditCardProps[] = []) => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <I18nextProvider i18n={i18n}>
          <CreditCardForm creditCards={initialCards} setCreditCards={mockSetCreditCards} />
        </I18nextProvider>
      </LocalizationProvider>
    );
  };

  it('should render the credit card form fields', () => {
    setup();

    expect(screen.getByText(/credit card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nEn.translation.creditCardNumber)).toBeInTheDocument();
    // Expiration date label is associated with multiple elements (input group),
    // so we just ensure at least one element with that accessible name exists.
    expect(screen.getAllByLabelText(i18nEn.translation.expirationDate).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /add card/i })).toBeInTheDocument();
  });

  it('should update card brand and number when typing a valid number', () => {
    setup();

    const numberInput = screen.getByLabelText(i18nEn.translation.creditCardNumber) as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '4111 1111 1111 1111' } });

    expect(detectCardBrand).toHaveBeenCalledWith('4111111111111111');
    // display should be formatted with spaces
    expect(numberInput.value.replace(/\s/g, '')).toBe('4111111111111111');
  });

  it('should update number state to empty string when input is cleared', () => {
    setup();

    const numberInput = screen.getByLabelText(i18nEn.translation.creditCardNumber) as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '4111111111111111' } });
    expect(numberInput.value.replace(/\s/g, '')).toBe('4111111111111111');

    fireEvent.change(numberInput, { target: { value: '' } });

    expect(detectCardBrand).toHaveBeenCalledWith('');
    expect(numberInput.value).toBe('');
  });

  it('should add a credit card when clicking "Add card"', () => {
    setup([]);

    const numberInput = screen.getByLabelText(i18nEn.translation.creditCardNumber) as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '4111111111111111' } });

    // Fill expiration date (required by validation) - select future month/year via spinbuttons
    const monthSpinbutton = screen.getByRole('spinbutton', { name: /month/i });
    fireEvent.click(monthSpinbutton);
    for (let i = 0; i < 6; i += 1) {
      fireEvent.keyDown(monthSpinbutton, { key: 'ArrowDown' });
    }
    const yearSpinbutton = screen.getByRole('spinbutton', { name: /year/i });
    fireEvent.click(yearSpinbutton);
    for (let i = 0; i < 6; i += 1) {
      fireEvent.keyDown(yearSpinbutton, { key: 'ArrowUp' });
    }

    fireEvent.click(screen.getByRole('button', { name: /add card/i }));

    expect(mockSetCreditCards).toHaveBeenCalledTimes(1);
    const [newCards] = mockSetCreditCards.mock.calls[0];
    expect(newCards).toHaveLength(1);
    expect(newCards[0]).toMatchObject({
      number: '4111111111111111',
      last4Digits: '1111',
    });
  });

  it('should use ExpirationDatePicker onChange and includes expiration in added card', () => {
    setup([]);

    const numberInput = screen.getByLabelText(i18nEn.translation.creditCardNumber) as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '4111111111111111' } });

    const monthSpinbutton = screen.getByRole('spinbutton', { name: /month/i });
    fireEvent.click(monthSpinbutton);
    for (let i = 0; i < 6; i += 1) {
      fireEvent.keyDown(monthSpinbutton, { key: 'ArrowDown' });
    }

    const yearSpinbutton = screen.getByRole('spinbutton', { name: /year/i });
    fireEvent.click(yearSpinbutton);
    for (let i = 0; i < 6; i += 1) {
      fireEvent.keyDown(yearSpinbutton, { key: 'ArrowUp' });
    }

    fireEvent.click(screen.getByRole('button', { name: /add card/i }));

    expect(formatExpirationDate).toHaveBeenCalledWith(expect.any(Date));
    const calledWithDate = (formatExpirationDate as jest.Mock).mock.calls[0][0] as Date;
    const formatted = dayjs(calledWithDate).format('MM/YY');
    expect(formatted).toMatch(/^\d{2}\/\d{2}$/);

    expect(mockSetCreditCards).toHaveBeenCalledTimes(1);
    const [newCards] = mockSetCreditCards.mock.calls[0];
    expect(newCards[0].expirationDate).toMatch(/^\d{2}\/\d{2}$/);
  });

  it('should not add card when number is empty', () => {
    setup([]);

    fireEvent.click(screen.getByRole('button', { name: /add card/i }));

    expect(mockSetCreditCards).not.toHaveBeenCalled();
  });

  it('should not add card when expiration date is empty', () => {
    setup([]);

    const numberInput = screen.getByLabelText(i18nEn.translation.creditCardNumber) as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '4111111111111111' } });

    fireEvent.click(screen.getByRole('button', { name: /add card/i }));

    expect(mockSetCreditCards).not.toHaveBeenCalled();
  });

  it('should list existing cards and allows deleting one', () => {
    const initialCards: CreditCardProps[] = [
      {
        flag: 'visa',
        last4Digits: '1111',
        number: '4111111111111111',
        expirationDate: '01/25',
      },
    ];

    setup(initialCards);

    expect(screen.getByText(/1111/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/delete/i));

    expect(mockSetCreditCards).toHaveBeenCalledWith([]);
  });
});

