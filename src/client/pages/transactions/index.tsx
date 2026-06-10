import React from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import TransactionList from './transactionList';
import AddTransactionForm from './addTransactionForm';
import {
  TransactionsWrapper,
  TransactionsList,
  ActionPanel,
 } from './styledComponents';
 import { TRANSACTION_TYPES } from '../../enums';

export default function Transactions(): React.JSX.Element {
  const { t } = useTranslation();
  const transactions = [{
    id: 1,
    name: 'test1',
    accountId: 1,
    type: TRANSACTION_TYPES.CARD_PURCHASE,
    value: 1234,
    date: new Date('01/12/2026'),
    userId: 123,
  },{
    id: 2,
    name: 'test2',
    accountId: 1,
    type: TRANSACTION_TYPES.TRANSFER_IN,
    value: 1234,
    userId: 123,
    date: new Date('01/14/2026'),
  },{
    id: 3,
    name: 'test2',
    accountId: 1,
    type: TRANSACTION_TYPES.WITHDRAW,
    value: 1234,
    date: new Date('01/15/2026'),
    userId: 123,
  },{
    id: 4,
    name: 'test2',
    accountId: 1,
    type: TRANSACTION_TYPES.PIX_OUT,
    value: 1234,
    date: new Date('01/12/2026'),
    userId: 123,
  }]

  return (
    <TransactionsWrapper>
      <TransactionsList>
        <Typography variant='h3' align='center'>{t('transactions')}</Typography>
        <Button variant='outlined'>
          {t('import')}
        </Button>
        <Button variant='contained'>
          {t('add')}
        </Button>
        <Divider orientation='horizontal' />
        <TransactionList
          transactions={transactions}
        />
      </TransactionsList>
      <ActionPanel>
        <AddTransactionForm />
      </ActionPanel>
    </TransactionsWrapper>
  );
}

