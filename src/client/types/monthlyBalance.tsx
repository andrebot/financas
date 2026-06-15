export type MonthlyBalance = {
  id: number;
  accountId: number;
  year: number;
  month: number;
  openingBalance: string;
  closingBalance: string;
  totalIn: string;
  totalOut: string;
};

export type MonthlyBalanceParams = {
  year: number;
  month: number;
};
