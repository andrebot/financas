import React, { useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Button } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { CreditCardsList } from '../../components/creditCard/styledComponents';
import CreditCard from '../../components/creditCard';
import { RowInput, TextFieldStyled } from '../../components/formStyledComponents';
import FlagIcon from '../../components/cardFlag';
import {
  CreditCardHolder,
  CreditCardHolderTitle,
  CreditCardFormHolder,
  ExpirationDatePicker,
  CreditCardDeleteItem,
  CreditCardItemHolder,
} from './styledComponents';
import { detectCardBrand, formatExpirationDate } from '../../utils/creditCard';
import {
  creditCardReducer,
  initialCreditCardFormState,
  validateCreditCardForm,
} from './creditCardReducer';
import { CreditCardActionType } from '../../enums';
import type { CreditCardProps, Flag, CreditCardFormProps } from '../../types';

/**
 * Form that handles the creation of a credit card.
 *
 * @param creditCards - The credit cards to display
 * @param setCreditCards - The function to set the credit cards
 * @returns The credit card form
 */
export default function CreditCardForm({ creditCards, setCreditCards }: CreditCardFormProps) {
  const { t } = useTranslation();
  const [cardBrand, setCardBrand] = useState<Flag>('unknown');
  const [state, dispatch] = useReducer(creditCardReducer, initialCreditCardFormState);

  /**
   * Formats digits as "#### #### #### ####" for display.
   *
   * @param digits - The digits to format.
   * @returns The formatted digits.
   */
  const formatCardNumberDisplay = (digits: string): string => digits.replace(/(\d{4})(?=\d)/g, '$1 ');

  /**
   * Handles the change of the credit card number. Strips non-digits,
   * limits to 16 digits, and updates state. Display is formatted separately.
   *
   * @param e - The event object.
   */
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    setCardBrand(detectCardBrand(rawValue.replace(/\D/g, '')));
    dispatch({ type: CreditCardActionType.SET_NUMBER, payload: rawValue });
  };

  /**
   * Handles the addition of a credit card. Validates the form first.
   * Adds the credit card to the list and resets the form state if valid.
   */
  const handleAddCard = () => {
    const validatedState = validateCreditCardForm(state);
    const isValid =
      !validatedState.numberError &&
      !validatedState.expirationDateError &&
      !!validatedState.number &&
      !!validatedState.expirationDate;

    if (!isValid) {
      dispatch({ type: CreditCardActionType.VALIDATE });
      return;
    }

    setCreditCards([
      ...creditCards,
      {
        flag: cardBrand,
        last4Digits: validatedState.number.slice(-4),
        number: validatedState.number,
        expirationDate: formatExpirationDate(validatedState.expirationDate),
      },
    ]);
    dispatch({ type: CreditCardActionType.RESET });
    setCardBrand('unknown');
  };

  /**
   * Handles the deletion of a credit card. Removes the credit card from the list.
   *
   * @param index - The index of the credit card to delete.
   */
  const handleDeleteCard = (index: number) => {
    setCreditCards(creditCards.filter((_, i) => i !== index));
  };

  return (
    <CreditCardHolder>
      <CreditCardHolderTitle>{t('creditCard')}</CreditCardHolderTitle>
      <CreditCardFormHolder>
        <RowInput>
          <TextFieldStyled
            label={t('creditCardNumber')}
            variant="outlined"
            value={formatCardNumberDisplay(state.number)}
            onChange={handleNumberChange}
            error={!!state.numberError}
            helperText={state.numberError ? t(state.numberError) : ''}
            inputProps={{ 'data-testid': 'credit-card-number-input' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FlagIcon flag={cardBrand} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <ExpirationDatePicker
            label={t('expirationDate')}
            views={['year', 'month']}
            format="MM/YY"
            value={state.expirationDate ? dayjs(state.expirationDate) : null}
            onChange={(e) =>
              dispatch({
                type: CreditCardActionType.SET_EXPIRATION_DATE,
                payload: e?.toDate(),
              })
            }
            slotProps={{
              textField: {
                error: !!state.expirationDateError,
                helperText: state.expirationDateError ? t(state.expirationDateError) : '',
                inputProps: { 'data-testid': 'credit-card-expiration-input' },
              },
            }}
          />
        </RowInput>
        <Button variant="contained" fullWidth onClick={handleAddCard} data-testid="credit-card-add-button">{t('addCard')}</Button>
      </CreditCardFormHolder>
      <CreditCardsList>
        {creditCards.map((card: CreditCardProps, index: number) => (
          <CreditCardItemHolder key={card.last4Digits}>
            <CreditCard
              flag={card.flag}
              last4Digits={card.last4Digits}
              expirationDate={card.expirationDate}
              number={card.number}
            />
            <CreditCardDeleteItem
              className="credit-card-delete-item"
              onClick={() => handleDeleteCard(index)}
              data-testid="credit-card-delete-item"
            >
              Delete
            </CreditCardDeleteItem>
          </CreditCardItemHolder>
        ))}
      </CreditCardsList>
    </CreditCardHolder>
  );
}
