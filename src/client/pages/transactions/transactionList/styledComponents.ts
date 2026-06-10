import { styled } from '@mui/material/styles';
import type { StyleCompProp } from '../../../types';

export const TransactionItem = styled('div')(({ theme } : StyleCompProp) => ({
  display: 'flex',
  position: 'relative',
  height: '60px',
  justifyContent: 'space-between',
  padding: '20px',
  gap: '20px',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: '5px',
  boxShadow: theme.shadows[4],
  backgroundColor: theme.palette.background.paper,
  width: '100%',
  overflow: 'hidden',
  '&.selected, &:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const TransactionItemTextWrapper = styled('div')(() => ({
  flexGrow: 1,
  textAlign: 'left',
}));

export const TransactionBankAccount = styled('div')(({ theme }: StyleCompProp) => ({
  color: theme.palette.primary.main,
  fontWeight: theme.typography.fontWeightLight,
  fontSize: theme.typography.caption.fontSize,
}));

export const TransactionValueWrapper = styled('div')(() => ({
  color: 'green',
  '&.negative': {
    color: 'red',
  }
}));

export const TransactionItemActions = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  gap: '10px',
  transition: 'right 300ms',
  position: 'absolute',
  right: '-110px',
  padding: '10px',
  backgroundColor: theme.palette.background.paper,
  height: '100%',
  alignItems: 'center',
  '&.selected': {
    right: 0,
  },
}));

export const TransactionItemList = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
}));

export const TransactionItemListWrapper = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  overflow: 'auto',
  height: 'calc(100% - 150px)',
}));
