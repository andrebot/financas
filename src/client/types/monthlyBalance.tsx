export type MonthlyBalance = {
  id: number;
  accountId: number;
  year: number;
  month: number;
  /** Numeric fields come back as strings from the PostgreSQL numeric type. */
  openingBalance: string;
  closingBalance: string;
  totalIn: string;
  totalOut: string;
};
