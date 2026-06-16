import React from 'react';
import { useTranslation } from 'react-i18next';
import ProgressCard from '../../../../components/progressCard';
import { useListGoalsForMonthQuery } from '../../../../features/goal';
import type { GoalsCardProps, ProgressColors } from '../../../../types';

const GOALS_COLORS: ProgressColors = {
  low: '#add8e6',
  medium: '#fff176',
  high: '#90ee90',
  complete: '#ffd700',
};

/**
 * Renders a progress card showing saved vs target value for every active goal
 * as of the selected month.
 *
 * @param props - {@link GoalsCardProps}
 */
export default function GoalsCard({ selectedYear, selectedMonth }: GoalsCardProps) {
  const { t } = useTranslation();
  const { data: goals = [] } = useListGoalsForMonthQuery({ year: selectedYear, month: selectedMonth + 1 });

  const items = goals
    .filter((g) => !g.archived)
    .map((g) => ({
      id: g.id,
      name: g.name,
      current: Number(g.savedValue),
      total: Number(g.value),
    }));

  return <ProgressCard title={t('goals')} items={items} colors={GOALS_COLORS} />;
}
