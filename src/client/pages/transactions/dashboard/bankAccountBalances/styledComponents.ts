import { styled } from '@mui/material/styles';
import type { StyleCompProp } from '../../../../types';

/** Column container holding the section title and the cards row. */
export const BalanceCardList = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
}));

/** Wrapping row that holds all bank account balance cards. */
export const BalanceCards = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  justifyContent: 'center',
}));

/** Individual card showing one bank account's name and running balance. */
export const BalanceCard = styled('div')(({ theme }: StyleCompProp) => ({
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

/** Row that places the bank icon and account name side by side. */
export const BankNameRow = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

/** Balance value — green when positive, red when negative. */
export const BalanceAmount = styled('span')(({ theme }: StyleCompProp) => ({
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.body1.fontSize,
  '&.positive': {
    color: theme.palette.success.main,
  },
  '&.negative': {
    color: theme.palette.error.main,
  },
}));
