import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CloseIcon from '@mui/icons-material/Close';
import { RowInput, TextFieldStyled, FormWrapper } from '../../components/formStyledComponents';
import { CurrencyFormControl, CreateBankAccountModal } from './styledComponents';
import { useModal } from '../../components/modal/modal';
import { reducer, ActionType } from './addBankAccountReducer';

export default function AddBankAccountModal() {
  const { t } = useTranslation();
  const { closeModal } = useModal();

  const [state, dispatch] = useReducer(reducer, {
    name: '',
    currency: '',
    accountNumber: '',
    agency: '',
    nameError: '',
    currencyError: '',
    accountNumberError: '',
    agencyError: '',
  });

  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: e.target.name as ActionType, payload: e.target.value });
  };

  const handleCurrencyChange = (e: SelectChangeEvent) => {
    dispatch({ type: ActionType.SET_CURRENCY, payload: e.target.value });
  };

  return (
    <CreateBankAccountModal elevation={3}>
      <FormWrapper>
        <RowInput>
          <Typography flexGrow='1' variant='h6'>{t('addBankAccount')}</Typography>
          <IconButton onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </RowInput>
        <RowInput>
          <TextFieldStyled 
            label={t('name')} 
            variant='outlined' 
            name={ActionType.SET_NAME} 
            onChange={handleBankAccountChange} 
            value={state.name} 
          />
          <CurrencyFormControl sx={{ flexGrow: '1' }}>
            <InputLabel id='currency-label'>{t('currency')}</InputLabel>
            <Select
              labelId='currency-label'
              id='currency-select'
              value={state.currency}
              label={t('currency')}
              onChange={handleCurrencyChange}
            >
              <MenuItem value='BRL'>R$ - BRL</MenuItem>
              <MenuItem value='USD'>$ - USD</MenuItem>
              <MenuItem value='EUR'>€ - EUR</MenuItem>
              <MenuItem value='GBP'>£ - GBP</MenuItem>
              <MenuItem value='JPY'>¥ - JPY</MenuItem>
              <MenuItem value='KRW'>₩ - KRW</MenuItem>
            </Select>
          </CurrencyFormControl>
        </RowInput>
        <RowInput>
          <TextFieldStyled 
            label={t('bankAccountNumber')}
            error={!!state.accountNumberError}
            helperText={state.accountNumberError}
            variant='outlined'
            name={ActionType.SET_ACCOUNT_NUMBER}
            onChange={handleBankAccountChange}
            value={state.accountNumber}
          />
          <TextFieldStyled 
            label={t('bankAgencyNumber')}
            variant='outlined'
            name={ActionType.SET_AGENCY}
            onChange={handleBankAccountChange}
            value={state.agency}
          />
        </RowInput>
        <RowInput>
          <Button variant='outlined' fullWidth onClick={closeModal}>{t('cancel')}</Button>
          <Button variant='contained' fullWidth onClick={closeModal}>{t('add')}</Button>
        </RowInput>
      </FormWrapper>
    </CreateBankAccountModal>
  );
}
