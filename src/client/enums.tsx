export enum BankAccountActionType {
  SET_NAME = 'SET_NAME',
  SET_CURRENCY = 'SET_CURRENCY',
  SET_ACCOUNT_NUMBER = 'SET_ACCOUNT_NUMBER',
  SET_AGENCY = 'SET_AGENCY',
  VALIDATE = 'VALIDATE',
}

export enum ChangePasswordActionType {
  SET_PROPERTY = 'SET_PROPERTY',
  SET_NEW_PASSWORD_ERROR = 'SET_NEW_PASSWORD_ERROR',
  SET_CONFIRM_PASSWORD_ERROR = 'SET_CONFIRM_PASSWORD_ERROR',
}

export enum CreditCardActionType {
  SET_NUMBER = 'SET_NUMBER',
  SET_EXPIRATION_DATE = 'SET_EXPIRATION_DATE',
  VALIDATE = 'VALIDATE',
  RESET = 'RESET',
}

export enum SettingsActionType {
  SET_FIRST_NAME_ERROR = 'SET_FIRST_NAME_ERROR',
  SET_LAST_NAME_ERROR = 'SET_LAST_NAME_ERROR',
  SET_PROPERTY = 'SET_PROPERTY',
  SET_IS_DIRTY = 'SET_IS_DIRTY',
  RESET_STATE = 'RESET_STATE',
}

export enum GoalActionType {
  SET_NAME = 'SET_NAME',
  SET_VALUE = 'SET_VALUE',
  SET_DUE_DATE = 'SET_DUE_DATE',
  VALIDATE = 'VALIDATE',
  RESET = 'RESET',
  EDIT = 'EDIT',
}

export enum TransactionFormActionType {
  SET_NAME = 'SET_NAME',
  SET_VALUE = 'SET_VALUE',
  SET_TYPE = 'SET_TYPE',
  SET_CATEGORY_ID = 'SET_CATEGORY_ID',
  SET_BANK_ACCOUNT_ID = 'SET_BANK_ACCOUNT_ID',
  SET_DATE = 'SET_DATE',
  VALIDATE = 'VALIDATE',
  EDIT = 'EDIT',
  RESET = 'RESET',
}

export enum BudgetFormActionType {
  SET_NAME = 'SET_NAME',
  SET_VALUE = 'SET_VALUE',
  SET_START_DATE = 'SET_START_DATE',
  SET_END_DATE = 'SET_END_DATE',
  SET_TYPE = 'SET_TYPE',
  SET_CATEGORY_IDS = 'SET_CATEGORY_IDS',
  VALIDATE = 'VALIDATE',
  EDIT = 'EDIT',
  RESET = 'RESET',
}

export enum GoalsTableActionType {
  EDIT = 'edit',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  UNARCHIVE = 'unarchive',
  DESELECT = 'deselect',
}

export enum BUDGET_TYPES {
  ANNUALY = 'annualy',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
}

export enum INVESTMENT_TYPES {
  CDB = 'cdb',
  LCI = 'lci',
  LCA = 'lca',
  STOCK = 'stock',
  FUND = 'fund',
  CRA = 'cra',
  CRI = 'cri',
  DEBENTURE = 'debenture',
  CURRENCY = 'currency',
  LC = 'lc',
  LF = 'lf',
  FII = 'fii',
  TRESURE = 'tresury',
  MUTUAL_FUND = 'mutual_fund',
  CRYPTO = 'crypto',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other',
}

export enum TransactionPanelPage {
  DASHBOARD = 'dashboard',
  ADD_TRANSACTION = 'addTransaction',
}

export enum TRANSACTION_TYPES {
  WITHDRAW = 'withdraw',
  TRANSFER_IN = 'transferIn',
  TRANSFER_OUT = 'transferOut',
  DEPOSIT = 'deposit',
  BANK_SLIP = 'bankSlip',
  CARD_PURCHASE = 'cardPurchase',
  CARD_REFUND = 'cardRefund',
  INVESTMENT_BUY = 'investmentBuy',
  INVESTMENT_SELL = 'investmentSell',
  INVESTMENT_DIVIDEND = 'investmentDividend',
  INVESTMENT_INTEREST = 'investmentInterest',
  INVESTMENT_DUE_DATE = 'investmentDueDate',
  PIX_IN = 'pixIn',
  PIX_OUT = 'pixOut',
}
