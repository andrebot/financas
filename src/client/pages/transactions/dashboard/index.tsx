import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import DashboardHeader from './dashboardHeader';
import BankAccountBalances from './bankAccountBalances';
import { useListTransactionsQuery } from '../../../features/transaction';
import { DashboardWrapper } from './styledComponents';

/**
 * Main dashboard panel. Owns the selected year/month state and passes it down
 * to the header and to the summary widgets that will be added below.
 */
export default function Dashboard() {
  const currentYear = dayjs().year();
  const { data: transactions = [] } = useListTransactionsQuery();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());

  const oldestYear = useMemo(() => {
    if (!transactions.length) return currentYear;
    return transactions.reduce((oldest, t) => {
      const year = dayjs(t.date).year();
      return year < oldest ? year : oldest;
    }, currentYear);
  }, [transactions, currentYear]);

  return (
    <DashboardWrapper>
      <DashboardHeader
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        oldestYear={oldestYear}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />
      <BankAccountBalances
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
      />
    </DashboardWrapper>
  );
}
