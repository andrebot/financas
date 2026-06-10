import React, { useState } from 'react';
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
 import { useListTransactionsQuery } from '../../features/transaction';
 import { TRANSACTION_TYPES } from '../../enums';
 import type { Transaction } from '../../types';

export default function Transactions(): React.JSX.Element {
  const { t } = useTranslation();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();
  const { data: transactions = [] } = useListTransactionsQuery();

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
          editSelectTrigger={setSelectedTransaction}
        />
      </TransactionsList>
      <ActionPanel>
        <AddTransactionForm selectedTransaction={selectedTransaction}/>
      </ActionPanel>
    </TransactionsWrapper>
  );
}

