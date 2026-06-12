import React from 'react';
import { useTranslation } from 'react-i18next';
import ProgressCard from '../../../../components/progressCard';
import { useListBudgetsQuery } from '../../../../features/budget';

export default function BudgetCard() {
  const { t } = useTranslation();
  const { data: budgets = [] } = useListBudgetsQuery();

  const items = budgets.map((b) => ({
    id: b.id,
    name: b.name,
    current: Number(b.spent ?? 0),
    total: Number(b.value),
  }));

  return <ProgressCard title={t('budget')} items={items} />;
}
