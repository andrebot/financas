import { styled } from '@mui/material/styles';
import type { StyleCompProp } from '../../types';

export const RegisterMainDiv = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

export const RegisterContainer = styled('div')(({ theme }: StyleCompProp) => ({
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
  [theme.breakpoints.between('xs', 'md')]: {
    width: '100%',
  },
  [theme.breakpoints.between('md', 'lg')]: {
    width: '50%',
  },
}));
