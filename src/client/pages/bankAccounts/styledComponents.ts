import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StyleCompProp } from '../../types';

export const CreateBankAccountModal = styled(Paper)(({ theme }: StyleCompProp) => ({
  padding: '20px',
  gap: '10px',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '500px',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
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

export const CreditCardHolder = styled('div')(({ theme }) => ({
  border: '1px solid #FFFFFF',
  borderColor: theme.palette.grey.A400,
  borderRadius: '5px',
  position: 'relative',
  marginTop: '5px',
  padding: '20px',
}));

export const CreditCardHolderTitle = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '-13px',
  left: '10px',
  padding: '0 5px',
  backgroundColor: theme.palette.background.default,
  backgroundImage: 'var(--Paper-overlay)',
}));

export const CreditCardFormHolder = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}));

export const ExpirationDatePicker = styled(DatePicker)(() => ({
  maxWidth: '130px',
}));

export const CreditCardItemHolder = styled('div')(() => ({
  position: 'relative',
  '&:hover': {
    '& .credit-card-delete-item': {
      display: 'flex',
    },
  },
}));

export const CreditCardDeleteItem = styled('div')(() => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'none',
  top: 0,
  cursor: 'pointer',
  userSelect: 'none',
  color: 'white',
}));
