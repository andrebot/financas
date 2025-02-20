import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { StyleCompProp } from '../../types';

export const AccountMenuContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
}));

export const NavMenuIcon = styled(IconButton)(() => ({
  marginRight: '1rem',
}));

export const NavTitle = styled(Typography)(() => ({
  flexGrow: 1,
}));

export const DrawerContainer = styled(Box)(() => ({
  width: 250,
}));
