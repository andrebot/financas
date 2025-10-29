import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

export const AccountBankItemMain = styled(Paper)(() => ({
    padding: '10px',
    maxWidth: '400px',
  }));
  
  export const AccountBankInfo = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }));

  export const CreditCardsList = styled('div')(() => ({
    display: 'flex',
    gap: '10px',
    width: '100%',
    overflow: 'auto',
    padding: '10px 5px 10px',
    '&::-webkit-scrollbar': {
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555',
    },
    scrollbarWidth: 'thin',
    scrollbarColor: '#888 transparent',
  }));