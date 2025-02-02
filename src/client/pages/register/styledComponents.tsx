import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';
import type { StyleCompProp } from '../../types';

const RegisterMainDiv = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const RegisterContainer = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.contrastText,
  borderRadius: '10px',
  boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
  width: '30%',
  paddingLeft: '20px',
  paddingRight: '20px',
  paddingBottom: '20px',
  gap: '20px',
}));

const RowInput = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '10px',
}));

const TextFieldStyled = styled(TextField)(({ theme }: StyleCompProp) => ({
  flexGrow: '1',
}));

export { RegisterMainDiv, RegisterContainer, RowInput, TextFieldStyled };