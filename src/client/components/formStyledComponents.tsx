import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';
import { StyleCompProp } from '../types';

export const FormWrapper = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}));

export const RowInput = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
  [theme.breakpoints.between('xs', 'md')]: {
    flexDirection: 'column',
  },
}));

export const TextFieldStyled = styled(TextField)(() => ({
  flexGrow: '1',
}));
