import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { formatValueToCurrency } from '../../utils/money';
import {
  ProgressBarContainer,
  ProgressBarFill,
  ProgressBarLabel,
  ProgressBarWrapper,
  ItemBox,
} from './styledComponents';
import type { ProgressItem, ProgressColors, ProgressCardProps } from '../../types';

function getBarColor(percentage: number, colors: ProgressColors): string {
  if (percentage >= 100) return colors.complete;
  if (percentage > 75) return colors.high;
  if (percentage > 40) return colors.medium;
  return colors.low;
}

export default function ProgressCard({ title, items, colors }: ProgressCardProps) {
  const { t } = useTranslation();
  const currency = t('currencyFormat');

  return (
    <ProgressBarWrapper elevation={3}>
      <Typography variant="h6" align="center">{title}</Typography>
      {items.map((item) => {
        const percentage = item.total > 0 ? Math.min((item.current / item.total) * 100, 100) : 0;
        const label = `${formatValueToCurrency(item.current, currency)} / ${formatValueToCurrency(item.total, currency)}`;
        const barColor = getBarColor(percentage, colors);

        return (
          <ItemBox key={item.id ?? item.name}>
            <Typography align="center" variant="body2">{item.name}</Typography>
            <ProgressBarContainer>
              <ProgressBarFill variant="determinate" value={percentage} barcolor={barColor} />
              <ProgressBarLabel>{label}</ProgressBarLabel>
            </ProgressBarContainer>
          </ItemBox>
        );
      })}
    </ProgressBarWrapper>
  );
}
