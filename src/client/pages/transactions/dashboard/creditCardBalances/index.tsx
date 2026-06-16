import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Typography from '@mui/material/Typography';
import { useListTransactionsQuery } from '../../../../features/transaction';
import { useListBankAccountsQuery } from '../../../../features/bankAccount';
import { formatValueToCurrency } from '../../../../utils/money';
import {
  CardBalanceSection,
  CardBalanceList,
  CardBalanceItem,
  CardBalanceAmount,
} from './styledComponents';
import type { CreditCardBalancesProps } from '../../../../types';

/**
 * Displays the total spend per credit card for the selected month, grouped by
 * each card's billing cycle (closing day of the previous month + 1 day through
 * closing day of the selected month).
 *
 * @param props - {@link CreditCardBalancesProps}
 */
export default function CreditCardBalances({ selectedYear, selectedMonth }: CreditCardBalancesProps) {
  const { t } = useTranslation();
  const { data: transactions = [] } = useListTransactionsQuery();
  const { data: bankAccounts = [] } = useListBankAccountsQuery();

  const cardInfoMap = useMemo(() => {
    const map: Record<number, { label: string; closingDay: number }> = {};
    bankAccounts.forEach((account) => {
      (account.cards ?? []).forEach((card) => {
        if (card.id) {
          map[card.id] = {
            label: `${account.name} - ${card.number.slice(-4)}`,
            closingDay: card.closingDay,
          };
        }
      });
    });
    return map;
  }, [bankAccounts]);

  const cardTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    transactions.forEach((t) => {
      if (!t.cardId) return;
      const info = cardInfoMap[t.cardId];
      if (!info) return;

      const { closingDay } = info;
      const cycleEnd = dayjs().year(selectedYear).month(selectedMonth).date(closingDay).endOf('day');
      const cycleStart = dayjs().year(selectedYear).month(selectedMonth - 1).date(closingDay).add(1, 'day').startOf('day');

      const d = dayjs(t.date);
      if (d.isBefore(cycleStart) || d.isAfter(cycleEnd)) return;

      totals[t.cardId] = (totals[t.cardId] ?? 0) + Number(t.value);
    });
    return totals;
  }, [transactions, cardInfoMap, selectedYear, selectedMonth]);

  const entries = Object.entries(cardTotals).map(([id, total]) => ({
    id: Number(id),
    label: cardInfoMap[Number(id)]?.label ?? `Card ${id}`,
    total,
  }));

  return (
    <CardBalanceSection elevation={3}>
      <Typography variant="h6" align="center">{t('creditCardBalances')}</Typography>
      <CardBalanceList>
        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">{t('noCardTransactions')}</Typography>
        ) : (
          entries.map((entry) => (
            <CardBalanceItem key={entry.id}>
              <CreditCardIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" align="center">{entry.label}</Typography>
              <CardBalanceAmount>
                {formatValueToCurrency(entry.total, t('currencyFormat'))}
              </CardBalanceAmount>
            </CardBalanceItem>
          ))
        )}
      </CardBalanceList>
    </CardBalanceSection>
  );
}
