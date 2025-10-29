import { SvgIconProps } from '@mui/material/SvgIcon';

export type Flag = 'amazon' | 'master' | 'visa' | 'amex' | 'diners' | 'discover' | 'maestro';

export type FlagIconProps = Omit<SvgIconProps, 'component' | 'viewBox'> & {
  flag: Flag;
};

export type CreditCardProps = {
  flag: Flag;
  last4Digits: string;
  expirationDate: string;
};

export type AccountBankItemProps = {
  bankAccount: BankAccount;
};

export type BankAccount = {
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
};
