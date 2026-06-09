import { typeIconMap } from '../pages/transactions/transactionList/transactionItem'

export type TransactionType = keyof typeof typeIconMap;

export type TransactionProps = {
  name: string;
  value: number;
  type: TransactionType;
  id: string;
  selectedId: string;
};

export type Transaction = {
  id: string;
  date: Date;
  name: string;
  value: number;
  type: TransactionType;
}

export type SortedTransactionItem = {
  date: Date;
  transactions: Transaction[];
} 

export type TransactionListProps = {
  transactions: Transaction[];
}
