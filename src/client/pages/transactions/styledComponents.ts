import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper'

export const TransactionsWrapper = styled('div')(() => ({
  display: 'flex',
  height: '100%',
  gap: '20px',
  padding: '10px',
  width: '100%',
}));

export const TransactionsList = styled(Paper)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  maxWidth: '570px',
  overflow: 'auto',
  padding: '10px',
  gap: '10px',
  justifyContent: 'center'
}));

export const ActionPanel = styled(Paper)(() => ({
  flexGrow: 1,
  padding: '10px',
  justifyContent: 'center',
}));
