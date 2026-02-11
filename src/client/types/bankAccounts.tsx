import { SvgIconProps } from '@mui/material/SvgIcon';
import { BankAccountActionType, CreditCardActionType } from '../enums';

export type Flag = 'amazon' | 'master' | 'visa' | 'amex' | 'diners' | 'discover' | 'maestro' | 'unknown';

export type FlagIconProps = Omit<SvgIconProps, 'component' | 'viewBox'> & {
  flag: Flag;
};

export type CreditCardProps = {
  flag: Flag;
  last4Digits: string;
  number: string;
  expirationDate: string;
};

export type CreditCardState = {
  number: string;
  expirationDate: Date | undefined;
  flag: string;
};

export type AccountBankItemProps = {
  bankAccount: BankAccount;
};

export type BankAccount = {
  id?: string;
  name: string;
  agency: string;
  accountNumber: string;
  cards: CreditCardProps[];
  currency: string;
  user: string;
};

export type BankAccountState = {
  name: string;
  currency: string;
  accountNumber: string;
  agency: string;
  nameError: string;
  currencyError: string;
  accountNumberError: string;
  agencyError: string;
  id?: string;
};

export type BankAccountAction = {
  type: BankAccountActionType.SET_NAME;
  payload: string;
} | {
  type: BankAccountActionType.SET_CURRENCY;
  payload: string;
} | {
  type: BankAccountActionType.SET_ACCOUNT_NUMBER;
  payload: string;
} | {
  type: BankAccountActionType.SET_AGENCY;
  payload: string;
} | {
  type: BankAccountActionType.VALIDATE;
}

export type CreditCardFormState = CreditCardState & {
  numberError: string;
  expirationDateError: string;
};

export type CreditCardFormAction =
  | { type: CreditCardActionType.SET_NUMBER; payload: string }
  | { type: CreditCardActionType.SET_EXPIRATION_DATE; payload: Date | undefined }
  | { type: CreditCardActionType.VALIDATE }
  | { type: CreditCardActionType.RESET };

export type CreditCardFormProps = {
  creditCards: CreditCardProps[];
  setCreditCards: (creditCards: CreditCardProps[]) => void;
};

export type CardBrand =
  | 'visa'
  | 'master'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'amazon'
  | 'maestro'
  | 'unknown';
