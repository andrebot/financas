import React, { useState } from 'react';
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
import { creditCardNumberRegex } from '../../utils/validators';
import { detectCardBrand, formatExpirationDate } from '../../utils/creditCard';
import { CreditCardProps, Flag, CreditCardState } from '../../types';

export default function CreditCardForm({ creditCards, setCreditCards }: { creditCards: CreditCardProps[], setCreditCards: (creditCards: CreditCardProps[]) => void }) {
  const { t } = useTranslation();
  const [cardBrand, setCardBrand] = useState<Flag>('unknown');
  const [creditCardState, setCreditCardState] = useState<CreditCardState>({
    number: '',
    expirationDate: undefined,
    flag: '',
  });

  /**
   * Formats digits as "#### #### #### ####" for display.
   *
   * @param digits - The digits to format.
   * @returns The formatted digits.
   */
  const formatCardNumberDisplay = (digits: string): string => {
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Handles the change of the credit card number. Strips non-digits,
   * limits to 16 digits, and updates state. Display is formatted separately.
   *
   * @param e - The event object.
   */
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);

    setCardBrand(detectCardBrand(digits));

    if (creditCardNumberRegex.test(digits) || digits === '') {
      setCreditCardState((prev) => ({ ...prev, number: digits }));
    }
  };

  /**
   * Handles the addition of a credit card. Adds the credit card to the 
   * list and resets the form state.
   */
  const handleAddCard = () => {
    setCreditCards([
      ...creditCards, 
      { 
        flag: cardBrand,
        last4Digits: creditCardState.number.slice(-4),
        number: creditCardState.number,
        expirationDate: formatExpirationDate(creditCardState.expirationDate)
      }
    ]);
    setCreditCardState({
      number: '',
      expirationDate: undefined,
      flag: '',
    });
    setCardBrand('unknown');
  }

  /**
   * Handles the deletion of a credit card. Removes the credit card from the list.
   *
   * @param index - The index of the credit card to delete.
   */
  const handleDeleteCard = (index: number) => {
    setCreditCards(creditCards.filter((_, i) => i !== index));
  }

  return (
    <CreditCardHolder>
      <CreditCardHolderTitle>{t('creditCard')}</CreditCardHolderTitle>
      <CreditCardFormHolder>
        <RowInput>
          <TextFieldStyled
            label={t('creditCardNumber')}
            variant='outlined'
            value={formatCardNumberDisplay(creditCardState.number)}
            onChange={handleNumberChange}
            slotProps={{
              input: {
                startAdornment: 
                <InputAdornment position='start'>
                  <FlagIcon flag={cardBrand} />
                </InputAdornment>,
              },
            }}
          />
          <ExpirationDatePicker
            label={t('expirationDate')}
            views={['year', 'month']}
            format='MM/YY'
            value={creditCardState.expirationDate ? dayjs(creditCardState.expirationDate) : undefined}
            onChange={(e) => setCreditCardState({ ...creditCardState, expirationDate: e?.toDate() })}
          />
        </RowInput>
        <Button variant='contained' fullWidth onClick={handleAddCard}>{t('addCard')}</Button>
      </CreditCardFormHolder>
      <CreditCardsList>
        {creditCards.map((card: CreditCardProps, index: number) => (
          <CreditCardItemHolder>
            <CreditCard key={card.last4Digits} {...card} />
            <CreditCardDeleteItem 
              className='credit-card-delete-item'
              onClick={() => handleDeleteCard(index)}
            >
              Delete
            </CreditCardDeleteItem>
          </CreditCardItemHolder>
        ))}
      </CreditCardsList>
    </CreditCardHolder>
  );
}
