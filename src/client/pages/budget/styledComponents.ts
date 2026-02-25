import { styled } from '@mui/material/styles';
import Select from '@mui/material/Select';
import type { StyleCompProp } from '../../types';
import { RowInput } from '../../components/formStyledComponents';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';

export const BudgetMain = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  padding: '0px 20px',
  overflow: 'auto',
  width: '100%',
}));

export const BudgetFormHolder = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  width: '100%',
}));

export const BudgetRowInput = styled(RowInput)(({ theme }: StyleCompProp) => ({
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  [theme.breakpoints.up('sm')]: {
    maxWidth: '800px',
  },
}));

export const BudgetTypeSelect = styled(Select)(({ theme }: StyleCompProp) => ({
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
  width: '120px',
}));

export const CategorySelect = styled(Select)(({ theme }: StyleCompProp) => ({
  [theme.breakpoints.up('sm')]: {
    width: '800px',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

export const DatePickerSelect = styled(DatePicker)(({ theme }: StyleCompProp) => ({
  width: '120px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

export const SaveBudgetButton = styled(Button)(({ theme }: StyleCompProp) => ({
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '800px',
  },
}));

export const CategoryFormControl = styled(FormControl)(({ theme }: StyleCompProp) => ({
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '800px',
  },
}));
