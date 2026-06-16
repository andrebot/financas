export type DashboardHeaderProps = {
  selectedYear: number;
  selectedMonth: number;
  oldestYear: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
};

export type BankAccountBalancesProps = {
  selectedYear: number;
  /** 0-indexed month from dayjs — converted to 1-indexed before calling the API. */
  selectedMonth: number;
};

export type BudgetCardProps = {
  selectedYear: number;
  selectedMonth: number;
};

export type GoalsCardProps = {
  selectedYear: number;
  selectedMonth: number;
};

export type CreditCardBalancesProps = {
  selectedYear: number;
  /** 0-indexed month from dayjs — converted to 1-indexed before calling the API. */
  selectedMonth: number;
};
