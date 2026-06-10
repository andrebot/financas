import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Divider from '@mui/material/Divider';
import TransactionItem from './transactionItem';
import {
  TransactionItemList,
  TransactionItemListWrapper,
} from './styledComponents';
import type {
  Transaction,
  SortedTransactionItem,
  TransactionListProps,
} from '../../../types';

function insertDescending<T extends { date: Date }>(arr: T[], item: T) {
  const insertIndex = arr.findIndex(
    (existing) => new Date(existing.date).getTime() < new Date(item.date).getTime()
  );

  if (insertIndex === -1) {
    arr.push(item);
  } else {
    arr.splice(insertIndex, 0, item);
  }
}

function insertTransaction(dayList: SortedTransactionItem, curTrans: Transaction) {
  insertDescending(dayList.transactions, curTrans);
}

function insertDayGroup(acc: SortedTransactionItem[], curTrans: Transaction) {
  insertDescending(acc, { date: curTrans.date, transactions: [curTrans] });
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const { t } = useTranslation();
  const [sortedTransactions, setSortedTransactions] = useState<SortedTransactionItem[]>([]);

  useEffect(() => {
    const sorted = transactions.reduce((acc, curTrans) => {
      const stringDate = dayjs(curTrans.date).format(t('dateFormat'));
      const dayList = acc.find((sortTrans) => dayjs(sortTrans.date).format(t('dateFormat')) === stringDate);

      if (dayList) {
        insertTransaction(dayList, curTrans);
      } else {
        insertDayGroup(acc, curTrans);
      }

      return acc;
    }, [] as SortedTransactionItem[]);

    setSortedTransactions(sorted);
  }, [transactions]);

  return (
    <TransactionItemListWrapper>
      {sortedTransactions.map((trans) => 
        <TransactionItemList key={trans.date.toISOString()}>
          {dayjs(trans.date).format(t('dateFormat'))}
          <Divider />
          {trans.transactions.map((trs) =>
            <TransactionItem
              key={trs.id}
              id={trs.id!}
              selectedId={0}
              name={trs.name}
              value={trs.value}
              type={trs.type}
            />
          )}
        </TransactionItemList>
      )}
    </TransactionItemListWrapper>
  );
};
