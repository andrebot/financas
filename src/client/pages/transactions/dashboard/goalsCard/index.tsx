import React from 'react';
import { useTranslation } from 'react-i18next';
import ProgressCard from '../../../../components/progressCard';
import { useListGoalsQuery } from '../../../../features/goal';

export default function GoalsCard() {
  const { t } = useTranslation();
  const { data: goals = [] } = useListGoalsQuery();

  const items = goals
    .filter((g) => !g.archived)
    .map((g) => ({
      id: g.id,
      name: g.name,
      current: Number(g.savedValue),
      total: Number(g.value),
    }));

  return <ProgressCard title={t('goals')} items={items} />;
}
