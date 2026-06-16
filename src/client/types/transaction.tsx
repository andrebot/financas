import { INVESTMENT_TYPES, TRANSACTION_TYPES, TransactionFormActionType } from '../enums';

export type TransactionProps = {
  transaction: Transaction;
  selectedId: number;
  onSelect: (id: number) => void;
  editSelectTrigger: (transaction: Transaction | undefined) => void;
};

export type Transaction = {
  id?: number;
  date: string;
  name: string;
  value: number;
  type: TRANSACTION_TYPES;
  categoryId?: number;
  accountId: number;
  cardId?: number;
  investmentType?: INVESTMENT_TYPES,
  userId: number,
  accountName?: string;
  categoryName?: string | null;
}

export type SortedTransactionItem = {
  date: string;
  transactions: Transaction[];
} 

export type TransactionListProps = {
  transactions: Transaction[];
  editSelectTrigger: (transaction: Transaction | undefined) => void;
}

export type TransactionFormState = {
  id?: number;
  name: string,
  value: number,
  type?: TRANSACTION_TYPES,
  categoryId: number,
  bankAccountId: number,
  cardId?: number,
  isCardType: boolean,
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
  type: TransactionFormActionType.SET_CARD_ID;
  payload: number | undefined;
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
