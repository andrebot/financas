import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { StyleCompProp } from '../../types';

export const ConfirmModalContainer = styled(Paper)(({ theme }: StyleCompProp) => ({
  padding: '1px 20px 20px 20px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '500px',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

export const ButtonHolded = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}));
