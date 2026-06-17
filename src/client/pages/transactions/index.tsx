import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import TransactionList from './transactionList';
import AddTransactionForm from './addTransactionForm';
import Dashboard from './dashboard';
import {
  TransactionsWrapper,
  TransactionsList,
  ActionPanel,
} from './styledComponents';
import { useListTransactionsQuery } from '../../features/transaction';
import { TransactionPanelPage } from '../../enums';
import type { Transaction } from '../../types';

export default function Transactions(): React.JSX.Element {
  const { t } = useTranslation();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();
  const [activePanelPage, setActivePanelPage] = useState<TransactionPanelPage>(
    TransactionPanelPage.DASHBOARD,
  );
  const { data: transactions = [] } = useListTransactionsQuery();

  const panelPages: Record<TransactionPanelPage, React.JSX.Element> = {
    [TransactionPanelPage.DASHBOARD]: <Dashboard />,
    [TransactionPanelPage.ADD_TRANSACTION]: (
      <AddTransactionForm
        selectedTransaction={selectedTransaction}
        onCancel={() => setActivePanelPage(TransactionPanelPage.DASHBOARD)}
      />
    ),
  };

  /**
   * Set the transaction to be edited and open the Edit transaction
   * page
   *
   * @param transaction Transaction to be edited
   */
  const editSelectTrigger = (transaction: Transaction | undefined) => {
    setSelectedTransaction(transaction);
    setActivePanelPage(TransactionPanelPage.ADD_TRANSACTION);
  };

  /**
   * Opens the Add Transaction page
   */
  const handleAddClick = () => {
    setActivePanelPage(TransactionPanelPage.ADD_TRANSACTION);
  };

  return (
    <TransactionsWrapper>
      <TransactionsList>
        <Typography variant="h3" align="center">{t('transactions')}</Typography>
        <Button variant="outlined">
          {t('import')}
        </Button>
        <Button variant="contained" onClick={handleAddClick}>
          {t('add')}
        </Button>
        <Divider orientation="horizontal" />
        <TransactionList
          transactions={transactions}
          editSelectTrigger={editSelectTrigger}
        />
      </TransactionsList>
      <ActionPanel>
        {panelPages[activePanelPage]}
      </ActionPanel>
    </TransactionsWrapper>
  );
}
