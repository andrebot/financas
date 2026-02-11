import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

export const ConfirmModalContainer = styled(Paper)(() => ({
  padding: '1px 20px 20px 20px',
}));

export const ButtonHolded = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}));
