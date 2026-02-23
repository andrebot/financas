import { styled } from '@mui/material/styles';
import type { StyleCompProp } from '../../types';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { RowInput } from '../../components/formStyledComponents';

export const GoalsMain = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  padding: '0px 20px',
  overflow: 'auto',
}));

export const GoalsTableWrapper = styled(Paper)(() => ({
  padding: '20px',
  width: '100%',
}));

export const SaveGoalButton = styled(Button)(() => ({
  maxHeight: '56px',
}));

export const GoalsRowInput = styled(RowInput)(({ theme }: StyleCompProp) => ({
  [theme.breakpoints.between('xs', 'md')]: {
    width: '100%',
  },
}));
