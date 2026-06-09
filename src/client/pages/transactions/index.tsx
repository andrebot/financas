import React from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import TransactionList from './transactionList';
import {
  TransactionsWrapper,
  TransactionsList,
 } from './styledComponents';

export default function Transactions(): React.JSX.Element {
  const { t } = useTranslation();
  const transactions = [{
    id: '1',
    name: 'test1',
    accountId: 'alksndsdkfbw83u',
    type: 'cardPurchase',
    value: 1234,
    date: new Date('01/12/2026'),
  },{
    id: '2',
    name: 'test2',
    accountId: 'alksndsdkfbw83u',
    type: 'transferIn',
    value: 1234,
    date: new Date('01/14/2026'),
  },{
    id: '3',
    name: 'test2',
    accountId: 'alksndsdkfbw83u',
    type: 'withdraw',
    value: 1234,
    date: new Date('01/15/2026'),
  },{
    id: '4',
    name: 'test2',
    accountId: 'alksndsdkfbw83u',
    type: 'pix',
    value: 1234,
    date: new Date('01/12/2026'),
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
      <h1>transactions</h1>
    </TransactionsWrapper>
  );
}

