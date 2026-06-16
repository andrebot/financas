import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import type { StyleCompProp } from '../../../../types';

export const CardBalanceSection = styled(Paper)(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  flexGrow: 1
}));

export const CardBalanceList = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  justifyContent: 'center',
}));

export const CardBalanceItem = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  minWidth: '180px',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
}));

export const CardBalanceAmount = styled('span')(({ theme }: StyleCompProp) => ({
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.body1.fontSize,
  color: theme.palette.error.main,
}));
