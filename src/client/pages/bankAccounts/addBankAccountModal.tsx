import React, { useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CloseIcon from '@mui/icons-material/Close';
import { RowInput, TextFieldStyled, FormWrapper } from '../../components/formStyledComponents';
import {
  CurrencyFormControl,
  CreateBankAccountModal,
} from './styledComponents';
import { useModal } from '../../components/modal/modal';
import { reducer, validateBankAccountForm } from './addBankAccountReducer';
import CreditCardForm from './creditCardForm';
import { useAuth } from '../../hooks/authContext';
import { BankAccountActionType } from '../../enums';
import { BankAccount, CreditCardProps } from '../../types';

type AddBankAccountModalProps = {
  saveBankAccount: (bankAccount: BankAccount) => void;
  bankAccount?: BankAccount;
};

const blankState = {
  name: '',
  currency: '',
  accountNumber: '',
  agency: '',
  nameError: '',
  currencyError: '',
  accountNumberError: '',
  agencyError: '',
};

/**
 * Modal that handles the creation of a bank account.
 *
 * @param addBankAccount - The function to add a bank account
 * @returns The add bank account modal
 */
export default function AddBankAccountModal({
  saveBankAccount,
  bankAccount,
}: AddBankAccountModalProps) {
  const { t } = useTranslation();
  const { closeModal } = useModal();
  const [creditCards, setCreditCards] = useState<CreditCardProps[]>(bankAccount?.cards || []);
  const { user } = useAuth();

  const [state, dispatch] = useReducer(reducer, {
    ...blankState,
    ...bankAccount,
  });

  /**
   * Handles the change event for the bank account name.
   *
   * @param e - The change event
   */
  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: e.target.name as BankAccountActionType, payload: e.target.value });
  };

  /**
   * Handles the change event for the currency.
   *
   * @param e - The change event
   */
  const handleCurrencyChange = (e: SelectChangeEvent) => {
    dispatch({ type: BankAccountActionType.SET_CURRENCY, payload: e.target.value });
  };

  /**
   * Handles the change event for the agency.
   *
   * @param e - The change event
   */
  const handleAgencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: BankAccountActionType.SET_AGENCY, payload: e.target.value });
  };

  /**
   * Saves the bank account by calling the addBankAccount function and closing the modal.
   * Validates the form first; does not save or close if validation fails.
   */
  const handleSaveBankAccount = () => {
    const validatedState = validateBankAccountForm(state);
    const isValid = !validatedState.nameError
      && !validatedState.currencyError
      && !validatedState.accountNumberError
      && !validatedState.agencyError;

    if (!isValid) {
      dispatch({ type: BankAccountActionType.VALIDATE });
      return;
    }

    saveBankAccount({
      name: validatedState.name,
      currency: validatedState.currency,
      accountNumber: validatedState.accountNumber,
      agency: validatedState.agency,
      cards: creditCards,
      id: state?.id,
      user: user!.id,
    });
    closeModal();
  };

  return (
    <CreateBankAccountModal elevation={3} data-testid="add-bank-account-modal">
      <FormWrapper>
        <RowInput>
          <Typography flexGrow="1" variant="h6">{t('addBankAccount')}</Typography>
          <IconButton onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </RowInput>
        <RowInput>
          <TextFieldStyled
            label={t('name')}
            variant="outlined"
            name={BankAccountActionType.SET_NAME}
            onChange={handleBankAccountChange}
            value={state.name}
            error={!!state.nameError}
            helperText={state.nameError ? t(state.nameError) : ''}
            inputProps={{ 'data-testid': 'bank-account-name-input' }}
          />
          <CurrencyFormControl sx={{ flexGrow: '1' }} error={!!state.currencyError}>
            <InputLabel id="currency-label">{t('currency')}</InputLabel>
            <Select
              labelId="currency-label"
              id="currency-select"
              value={state.currency}
              label={t('currency')}
              onChange={handleCurrencyChange}
              data-testid="bank-account-currency-select"
            >
              <MenuItem value="BRL">R$ - BRL</MenuItem>
              <MenuItem value="USD">$ - USD</MenuItem>
              <MenuItem value="EUR">€ - EUR</MenuItem>
              <MenuItem value="GBP">£ - GBP</MenuItem>
              <MenuItem value="JPY">¥ - JPY</MenuItem>
              <MenuItem value="KRW">₩ - KRW</MenuItem>
            </Select>
            {state.currencyError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {t(state.currencyError)}
              </Typography>
            )}
          </CurrencyFormControl>
        </RowInput>
        <RowInput>
          <TextFieldStyled
            label={t('bankAccountNumber')}
            error={!!state.accountNumberError}
            helperText={state.accountNumberError ? t(state.accountNumberError) : ''}
            variant="outlined"
            name={BankAccountActionType.SET_ACCOUNT_NUMBER}
            onChange={handleBankAccountChange}
            value={state.accountNumber}
            inputProps={{ 'data-testid': 'bank-account-number-input' }}
          />
          <TextFieldStyled
            label={t('bankAgencyNumber')}
            variant="outlined"
            name={BankAccountActionType.SET_AGENCY}
            onChange={handleAgencyChange}
            value={state.agency}
            error={!!state.agencyError}
            helperText={state.agencyError ? t(state.agencyError) : ''}
            inputProps={{ 'data-testid': 'bank-account-agency-input' }}
          />
        </RowInput>
        <CreditCardForm creditCards={creditCards} setCreditCards={setCreditCards} />
        <RowInput>
          <Button variant="outlined" fullWidth onClick={closeModal} data-testid="bank-account-cancel-button">{t('cancel')}</Button>
          <Button variant="contained" fullWidth onClick={handleSaveBankAccount} data-testid="bank-account-save-button">{t('save')}</Button>
        </RowInput>
      </FormWrapper>
    </CreateBankAccountModal>
  );
}
