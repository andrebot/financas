import { INVESTMENT_TYPES, TRANSACTION_TYPES, TransactionFormActionType } from '../enums';

export type TransactionProps = {
  name: string;
  value: number;
  type: TRANSACTION_TYPES;
  id: number;
  selectedId: number;
};

export type Transaction = {
  id?: number;
  date: Date;
  name: string;
  value: number;
  type: TRANSACTION_TYPES;
  categoryId?: number;
  accountId: number;
  investmentType?: INVESTMENT_TYPES,
  userId: number,
}

export type SortedTransactionItem = {
  date: Date;
  transactions: Transaction[];
} 

export type TransactionListProps = {
  transactions: Transaction[];
}

export type TransactionFormState = {
  id?: number;
  name: string,
  value: number,
  type?: TRANSACTION_TYPES,
  categoryId: number,
  bankAccountId: number,
  date: Date,
  nameError: string,
  dateError: string,
  valueError: string,
  categoryError: string,
  bankAccountError: string,
  typeError: string,
}

export type TransactionActionFunction = (state: TransactionFormState, payload?: any) => TransactionFormState;

export type TransactionFormAction = {
  type: TransactionFormActionType.SET_NAME;
  payload: string;
} | {
  type: TransactionFormActionType.SET_VALUE;
  payload: number | undefined | null;
} | {
  type: TransactionFormActionType.SET_TYPE;
  payload: TRANSACTION_TYPES;
} | {
  type: TransactionFormActionType.SET_CATEGORY_ID;
  payload: number;
} | {
  type: TransactionFormActionType.SET_BANK_ACCOUNT_ID;
  payload: number;
} | {
  type: TransactionFormActionType.SET_DATE;
  payload: Date | undefined | null;
} | {
  type: TransactionFormActionType.VALIDATE;
  payload?: never;
} | {
  type: TransactionFormActionType.EDIT;
  payload: Transaction;
} | {
  type: TransactionFormActionType.RESET;
  payload?: never;
};
