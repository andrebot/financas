import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { StyleCompProp } from '../../../types';

export const AddTransactionWrapper = styled('div')(() => ({
  display: 'flex',
  flexFlow: 'column',
  gap: '20px',
}));

export const CategorySelect = styled(FormControl)(({ theme }: StyleCompProp) => ({
  width: '250px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  }
}));

export const BankSelect = styled(FormControl)(({ theme }: StyleCompProp) => ({
  width: '200px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  }
}));

export const TypeSelect = styled(FormControl)(({ theme }: StyleCompProp) => ({
  width: '210px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  }
}));

export const TransactionDatePicker = styled(DatePicker)(({ theme }: StyleCompProp) => ({
  width: '150px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  }
}));
