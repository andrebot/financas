import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import type { StyleCompProp } from '../../types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const SettingsMain = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
}));

export const SettingsSection = styled(Paper)(() => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}));

export const HorizontalContainer = styled('div')(() => ({
  display: 'flex',
  gap: '10px',
}));

export const TextFieldStyled = styled(TextField)(() => ({
  flexGrow: '1',
}));

export const InfoButton = styled(Button)(() => ({
  flexGrow: '1',
}));

export const ChangePasswordButton = styled(Button)(() => ({
  width: '100%',
}));

export const ChangePasswordModalContainer = styled(Paper)(({ theme }: StyleCompProp) => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  [theme.breakpoints.up('md')]: {
    maxWidth: '427px',
  },
}));

export const ChangePasswordModalTitle = styled(Typography)(() => ({
  marginBottom: '20px',
}));
