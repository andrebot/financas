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