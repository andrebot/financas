import { styled } from '@mui/material/styles';

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
