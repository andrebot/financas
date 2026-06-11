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

/**
 * Inserts an item into a date-sorted array in descending order (newest first).
 * Mutates the array in place.
 * 
 * @template T - Object type with a `date` string field
 * @param arr - The target array to insert into
 * @param item - The item to insert
 */
function insertDescending<T extends { date: string }>(arr: T[], item: T) {
  const insertIndex = arr.findIndex(
    (existing) => new Date(existing.date).getTime() < new Date(item.date).getTime()
  );

  if (insertIndex === -1) {
    arr.push(item);
  } else {
    arr.splice(insertIndex, 0, item);
  }
}

/**
 * Inserts a transaction into an existing day group, preserving descending date order.
 *
 * @param dayList - The day group to insert the transaction into
 * @param curTrans - The transaction to insert
 */
function insertTransaction(dayList: SortedTransactionItem, curTrans: Transaction) {
  insertDescending(dayList.transactions, curTrans);
}

/**
 * Creates a new day group for the given transaction and inserts it into the
 * accumulator array in descending date order.
 *
 * @param acc - The accumulator array of day groups
 * @param curTrans - The transaction whose date will seed the new group
 */
function insertDayGroup(acc: SortedTransactionItem[], curTrans: Transaction) {
  insertDescending(acc, { date: curTrans.date, transactions: [curTrans] });
}

/**
 * Renders a list of transactions grouped by day in descending chronological order.
 * Each day group shows a formatted date header followed by its transactions.
 *
 * @param props - {@link TransactionListProps}
 */
export default function TransactionList({
  transactions,
  editSelectTrigger,
}: TransactionListProps) {
  const { t } = useTranslation();
  const [selectedListItem, setSelectedListItem] = useState(0);
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
        <TransactionItemList key={trans.date}>
          {dayjs(trans.date).format(t('dateFormat'))}
          <Divider />
          {trans.transactions.map((trs) =>
            <TransactionItem
              key={trs.id}
              transaction={trs}
              selectedId={selectedListItem}
              onSelect={setSelectedListItem}
              editSelectTrigger={editSelectTrigger}
            />
          )}
        </TransactionItemList>
      )}
    </TransactionItemListWrapper>
  );
};
