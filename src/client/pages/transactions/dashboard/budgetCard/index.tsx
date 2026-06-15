import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import ProgressCard from '../../../../components/progressCard';
import { useListBudgetsQuery } from '../../../../features/budget';
import type { BudgetCardProps, ProgressColors } from '../../../../types';

const BUDGET_COLORS: ProgressColors = {
  low: '#90ee90',
  medium: '#fff176',
  high: '#ffb74d',
  complete: '#f44336',
};

export default function BudgetCard({ selectedYear, selectedMonth }: BudgetCardProps) {
  const { t } = useTranslation();
  const { data: budgets = [] } = useListBudgetsQuery();

  const firstOfMonth = dayjs().year(selectedYear).month(selectedMonth).startOf('month');
  const lastOfMonth = dayjs().year(selectedYear).month(selectedMonth).endOf('month');

  const items = budgets
    .filter((b) => !dayjs(b.startDate).isAfter(lastOfMonth) && !dayjs(b.endDate).isBefore(firstOfMonth))
    .map((b) => ({
      id: b.id,
      name: b.name,
      current: Number(b.spent ?? 0),
      total: Number(b.value),
    }));

  return <ProgressCard title={t('budget')} items={items} colors={BUDGET_COLORS} />;
}
