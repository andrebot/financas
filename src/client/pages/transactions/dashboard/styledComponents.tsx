import { styled } from '@mui/material/styles';
import type { StyleCompProp } from '../../../types';

export const DashboardWrapper = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
}));

export const BudgetGoalsWrapper = styled('div')(() => ({
  display: 'flex',
  gap: '20px',
}));

export const ProgressRow = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '20px',
  alignItems: 'flex-start',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));
