import React from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { formatValueToCurrency } from '../../utils/money';
import {
  ProgressBarContainer,
  ProgressBarFill,
  ProgressBarLabel,
  ProgressBarWrapper,
} from './styledComponents';

export type ProgressItem = {
  id?: number;
  name: string;
  current: number;
  total: number;
};

type ProgressCardProps = {
  title: string;
  items: ProgressItem[];
};

export default function ProgressCard({ title, items }: ProgressCardProps) {
  const { t } = useTranslation();
  const currency = t('currencyFormat');

  return (
    <ProgressBarWrapper elevation={3}>
      <Typography variant="h6" align="center">{title}</Typography>
      {items.map((item) => {
        const percentage = item.total > 0 ? Math.min((item.current / item.total) * 100, 100) : 0;
        const label = `${formatValueToCurrency(item.current, currency)} / ${formatValueToCurrency(item.total, currency)}`;

        return (
          <Box key={item.id ?? item.name} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography align='center' variant="body2">{item.name}</Typography>
            <ProgressBarContainer>
              <ProgressBarFill variant="determinate" value={percentage} />
              <ProgressBarLabel>{label}</ProgressBarLabel>
            </ProgressBarContainer>
          </Box>
        );
      })}
    </ProgressBarWrapper>
  );
}
