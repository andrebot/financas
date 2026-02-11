import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import CreditCard from '../../../../src/client/components/creditCard';
import type { CreditCardProps } from '../../../../src/client/types';

jest.mock('../../../../src/client/components/cardFlag', () => ({
  __esModule: true,
  default: ({ flag }: { flag: string }) => <span data-testid="flag-icon">{flag}</span>,
}));

describe('CreditCard', () => {
  const defaultProps: CreditCardProps = {
    flag: 'visa',
    last4Digits: '1234',
    number: '4111111111111234',
    expirationDate: '01/25',
  };

  const renderCreditCard = (props: CreditCardProps = defaultProps) =>
    render(
      <I18nextProvider i18n={i18n}>
        <CreditCard {...props} />
      </I18nextProvider>
    );

  it('should render the credit label', () => {
    renderCreditCard();

    expect(screen.getByText(i18nEn.translation.credit)).toBeInTheDocument();
  });

  it('should render the FlagIcon with the correct flag', () => {
    renderCreditCard();

    const flagIcon = screen.getByTestId('flag-icon');
    expect(flagIcon).toBeInTheDocument();
    expect(flagIcon).toHaveTextContent('visa');
  });

  it('should render the masked card number with last 4 digits', () => {
    renderCreditCard();

    expect(screen.getByText('**** **** **** 1234')).toBeInTheDocument();
  });

  it('should render the expires label', () => {
    renderCreditCard();

    expect(screen.getByText(i18nEn.translation.expires)).toBeInTheDocument();
  });

  it('should render the expiration date', () => {
    renderCreditCard();

    expect(screen.getByText('01/25')).toBeInTheDocument();
  });

  it('should render different last4Digits when provided', () => {
    renderCreditCard({ ...defaultProps, last4Digits: '5678' });

    expect(screen.getByText('**** **** **** 5678')).toBeInTheDocument();
  });

  it('should render different expiration date when provided', () => {
    renderCreditCard({ ...defaultProps, expirationDate: '12/26' });

    expect(screen.getByText('12/26')).toBeInTheDocument();
  });
});
