import React from 'react';
import { useTranslation } from 'react-i18next';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Typography from '@mui/material/Typography';
import { useListBankAccountsQuery } from '../../../../features/bankAccount';
import { useListMonthlyBalancesQuery } from '../../../../features/monthlyBalance';
import { formatValueToCurrency } from '../../../../utils/money';
import { BalanceCardList, BalanceCards, BalanceCard, BankNameRow, BalanceAmount } from './styledComponents';
import type { BankAccountBalancesProps } from '../../../../types';

/**
 * Renders a wrapping list of cards showing the closing balance of every
 * registered bank account for the selected month/year, sourced from the
 * server-side monthlyBalance resource.
 *
 * @param props - {@link BankAccountBalancesProps}
 */
export default function BankAccountBalances({ selectedYear, selectedMonth }: BankAccountBalancesProps) {
  const { t } = useTranslation();
  const { data: bankAccounts = [] } = useListBankAccountsQuery();
  const { data: monthlyBalances = [] } = useListMonthlyBalancesQuery({
    year: selectedYear,
    month: selectedMonth + 1,
  });

  return (
    <BalanceCardList>
      <Typography variant="h6" align="center">{t('bankAccountBalances')}</Typography>
      <BalanceCards>
        {bankAccounts.map((account) => {
          const record = monthlyBalances.find((mb) => mb.accountId === Number(account.id));
          const balance = record ? Number(record.closingBalance) : null;

          return (
            <BalanceCard key={account.id}>
              <BankNameRow>
                <AccountBalanceIcon fontSize="small" />
                <Typography variant="subtitle2">{account.name}</Typography>
              </BankNameRow>
              <BalanceAmount className={balance === null ? '' : balance < 0 ? 'negative' : 'positive'}>
                {balance === null
                  ? '—'
                  : formatValueToCurrency(balance, t('currencyFormat'))}
              </BalanceAmount>
            </BalanceCard>
          );
        })}
      </BalanceCards>
    </BalanceCardList>
  );
}
