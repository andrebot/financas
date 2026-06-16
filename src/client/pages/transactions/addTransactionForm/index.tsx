import React, { useReducer, useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import {
  transactionFormReducer,
  initialTransactionFormState,
  validateTransactionFormState,
  hasTransactionFormErrors,
} from './TransactionFormReducer';
import { useAuth } from '../../../hooks/authContext';
import {
  AddTransactionWrapper,
  CategorySelect,
  BankSelect,
  CardSelect,
  TypeSelect,
  TransactionDatePicker,
} from './styledComponents';
import { RowInput } from '../../../components/formStyledComponents';
import { TransactionFormActionType, TRANSACTION_TYPES } from '../../../enums';
import { useFormattedCategories } from '../../../hooks/useFormattedCategories';
import { useListBankAccountsQuery } from '../../../features/bankAccount';
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from '../../../features/transaction';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { PickerValue } from '@mui/x-date-pickers/internals/models';
import type { Transaction } from '../../../types';

/**
 * Form used to create or update a transaction.
 * Loads available categories and bank accounts from the API to populate their
 * respective selects. On save it runs full validation and dispatches either a
 * create or update mutation depending on whether the form state carries an id.
 *
 * @returns The add/edit transaction form component.
 */
export default function AddTransactionForm({
  selectedTransaction,
  onCancel,
}: {
  selectedTransaction: Transaction | undefined;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const formattedCategories = useFormattedCategories();
  const { data: bankAccounts = [] } = useListBankAccountsQuery();
  const cardOptions = bankAccounts.flatMap((account) =>
    (account.cards ?? []).filter((card) => card.id).map((card) => ({
      id: card.id!,
      label: `${account.name} - ${card.number.slice(-4)}`,
    }))
  );
  const [createTransaction] = useCreateTransactionMutation();
  const [updateTransaction] = useUpdateTransactionMutation();
  const [transactionFormState, transactionFormDispatch] = useReducer(
    transactionFormReducer,
    initialTransactionFormState,
  );

  /**
   * Dispatches the typed name to the reducer, which validates and stores it.
   *
   * @param event - The input change event from the name text field.
   */
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    transactionFormDispatch({ type: TransactionFormActionType.SET_NAME, payload: event.target.value });
  };

  /**
   * Dispatches the selected category id to the reducer.
   * The category determines which budgets are affected when the transaction is saved.
   *
   * @param event - The select change event from the category dropdown.
   */
  const handleCategoryChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;

    const type = value as number;
    transactionFormDispatch({ type: TransactionFormActionType.SET_CATEGORY_ID, payload: type });
  };

  /**
   * Dispatches the selected bank account id to the reducer.
   * The bank account is the source or destination account for the transaction and is required by the DB.
   *
   * @param event - The select change event from the bank account dropdown.
   */
  const handleBankChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;

    const type = value as number;
    transactionFormDispatch({ type: TransactionFormActionType.SET_BANK_ACCOUNT_ID, payload: type });
  };

  const handleCardChange = (event: SelectChangeEvent<unknown>) => {
    const value = event.target.value;
    transactionFormDispatch({
      type: TransactionFormActionType.SET_CARD_ID,
      payload: value ? Number(value) : undefined,
    });
  };

  /**
   * Dispatches the selected transaction type to the reducer.
   * The type controls how the monthly balance totals (in/out) are updated on the server.
   *
   * @param event - The select change event from the transaction type dropdown.
   */
  const CARD_TYPES = [TRANSACTION_TYPES.CARD_PURCHASE, TRANSACTION_TYPES.CARD_REFUND];
  const isCardType = transactionFormState.type !== undefined && CARD_TYPES.includes(transactionFormState.type);

  const handleTypeChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;

    const type = value as TRANSACTION_TYPES;
    transactionFormDispatch({ type: TransactionFormActionType.SET_TYPE, payload: type });

    if (!CARD_TYPES.includes(type)) {
      transactionFormDispatch({ type: TransactionFormActionType.SET_CARD_ID, payload: undefined });
    }
  };

  /**
   * Converts the date picker value to a JS Date and dispatches it to the reducer.
   * The reducer rejects future dates to prevent recording transactions that haven't occurred yet.
   *
   * @param event - The value emitted by the MUI date picker on change.
   */
  const handleDateChange = (event: PickerValue) => {
    transactionFormDispatch({ type: TransactionFormActionType.SET_DATE, payload: event?.toDate() });
  };

  /**
   * Parses the raw input string as a number and dispatches it to the reducer.
   * The reducer rejects zero and negative values.
   *
   * @param event - The input change event from the value text field.
   */
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    transactionFormDispatch({
      type: TransactionFormActionType.SET_VALUE,
      payload: Number(event.target.value),
    });
  };

  /**
   * Resets the form to its initial blank state, discarding any unsaved input,
   * then notifies the parent so it can hide this form.
   */
  const handleCancel = () => {
    transactionFormDispatch({ type: TransactionFormActionType.RESET });
    onCancel?.();
  };

  /**
   * Validates all fields and persists the transaction.
   * Runs the full validation pass first and shows an error snackbar if any
   * field fails. On success it resets the form and shows a success snackbar;
   * on API failure it shows an error snackbar without clearing the form.
   */
  const handleSaveTransaction = async () => {
    const validatedState = validateTransactionFormState(transactionFormState);
    transactionFormDispatch({ type: TransactionFormActionType.VALIDATE });

    if (hasTransactionFormErrors(validatedState)) {
      enqueueSnackbar(t('fixErrorsBeforeSaving'), { variant: 'error' });
      return;
    }

    const action = transactionFormState.id ? updateTransaction : createTransaction;

    try {
      await action({
        id: transactionFormState.id,
        name: transactionFormState.name,
        date: transactionFormState.date.toISOString(),
        value: transactionFormState.value,
        type: transactionFormState.type!,
        categoryId: transactionFormState.categoryId,
        accountId: transactionFormState.bankAccountId,
        cardId: transactionFormState.cardId,
        userId: Number(user!.id),
      }).unwrap();

      transactionFormDispatch({ type: TransactionFormActionType.RESET });
      enqueueSnackbar(t('transactionCreated'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('transactionCreationFailed'), { variant: 'error' });
    }
  };

  useEffect(() => {
    if (selectedTransaction) {
      transactionFormDispatch({ type: TransactionFormActionType.EDIT, payload: selectedTransaction });
    }
  }, [selectedTransaction]);

  return (
    <AddTransactionWrapper>
      <Typography variant='h3' align='center'>{t('addTransaction')}</Typography>
      <RowInput>
        <TextField
          label={t('name')}
          sx={{flexGrow: 1}}
          value={transactionFormState.name}
          onChange={handleNameChange}
          error={!!transactionFormState.nameError}
          helperText={transactionFormState.nameError ? t(transactionFormState.nameError) : ''}
        />
        <CategorySelect error={!!transactionFormState.categoryError}>
          <InputLabel id='transaction-label'>{t('category')}</InputLabel>
          <Select
            label={t('category')}
            labelId='transaction-label'
            value={transactionFormState.categoryId || ''}
            onChange={handleCategoryChange}
          >
            {formattedCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>{category.label}</MenuItem>
            ))}
          </Select>
        </CategorySelect>
        <BankSelect error={!!transactionFormState.bankAccountError}>
          <InputLabel id='bank-account-label'>{t('bankAccount')}</InputLabel>
          <Select
            label='Bank Accounts'
            labelId='bank-account-label'
            value={transactionFormState.bankAccountId || ''}
            onChange={handleBankChange}
          >
            {bankAccounts.map((bankAccount) => (
              <MenuItem key={bankAccount.id} value={bankAccount.id}>{bankAccount.name}</MenuItem>
            ))}
          </Select>
        </BankSelect>
      </RowInput>
      <RowInput>
        <TypeSelect>
          <InputLabel id='type-label'>{t('type')}</InputLabel>
          <Select
            label={t('type')}
            labelId='type-label'
            value={transactionFormState.type ?? ''}
            onChange={handleTypeChange}
          >
            {Object.values(TRANSACTION_TYPES).map((type) => (
              <MenuItem key={type} value={type}>{t(type)}</MenuItem>
            ))}
          </Select>
        </TypeSelect>
        <TransactionDatePicker
          format='DD/MM/YYYY'
          value={transactionFormState.date ? dayjs(transactionFormState.date) : null}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              error: !!transactionFormState.dateError,
              helperText: transactionFormState.dateError ? t(transactionFormState.dateError) : '',
            },
          }}
        />
        <CardSelect>
          <InputLabel id='card-label'>{t('card')}</InputLabel>
          <Select
            label={t('card')}
            labelId='card-label'
            value={transactionFormState.cardId ?? ''}
            onChange={handleCardChange}
            disabled={!isCardType}
          >
            <MenuItem value=''><em>{t('none')}</em></MenuItem>
            {cardOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
            ))}
          </Select>
        </CardSelect>
        <TextField
          label={t('value')}
          value={transactionFormState.value}
          onChange={handleValueChange}
          error={!!transactionFormState.valueError}
          helperText={transactionFormState.valueError ? t(transactionFormState.valueError) : ''}
          sx={{flexGrow: 1}}
          slotProps={{
            input: {
              inputMode: 'decimal',
              startAdornment: <InputAdornment position="start">{t('currencySymbol')}</InputAdornment>,
            },
          }}
        />
      </RowInput>
      <Button variant='contained' onClick={handleSaveTransaction}>{t('save')}</Button>
      <Button variant='outlined' onClick={handleCancel}>{t('cancel')}</Button>
    </AddTransactionWrapper>
  );
}
