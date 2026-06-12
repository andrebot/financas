import React from 'react';
import { useTranslation } from 'react-i18next';
import ProgressCard, { ProgressColors } from '../../../../components/progressCard';
import { useListBudgetsQuery } from '../../../../features/budget';

const BUDGET_COLORS: ProgressColors = {
  low: '#90ee90',
  medium: '#fff176',
  high: '#ffb74d',
  complete: '#f44336',
};

export default function BudgetCard() {
  const { t } = useTranslation();
  const { data: budgets = [] } = useListBudgetsQuery();

  const items = budgets.map((b) => ({
    id: b.id,
    name: b.name,
    current: Number(b.spent ?? 0),
    total: Number(b.value),
  }));

  return <ProgressCard title={t('budget')} items={items} colors={BUDGET_COLORS} />;
}
