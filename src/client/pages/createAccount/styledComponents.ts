import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';

export const CreateBankAccountModal = styled(Paper)(() => ({
  padding: '20px',
  gap: '10px',
}));

export const CreateAccountMain = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px'
}));

export const AccountBankList = styled('div')(() => ({
  display: 'flex',
  width: '100%',
  flexWrap: 'wrap',
  gap: '10px',
  justifyContent: 'center'
}));

export const AddAccountButton = styled(Tooltip)(() => ({
  alignSelf: 'center',
}));

export const CurrencyFormControl = styled(FormControl)(() => ({
  width: '50px',
}));
