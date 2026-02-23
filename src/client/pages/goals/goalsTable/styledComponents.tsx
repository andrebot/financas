import { styled } from '@mui/material/styles';
import type { StyleCompProp } from '../../../types';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';

export const GoalsMain = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  padding: '0px 20px',
}));

export const GoalsTable = styled(Paper)(() => ({
  padding: '20px',
  width: '100%',
}));

export const SaveGoalButton = styled(Button)(() => ({
  maxHeight: '56px',
}));

export const GoalsTableCell = styled(TableCell)(() => ({
  width: '150px',
}));

export const GoalsTableCellAction = styled(TableCell)(() => ({
  width: '180px',
}));

export const GoalsTableEmpty = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  padding: '20px',
}));
