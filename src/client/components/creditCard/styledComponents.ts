import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const CardItem = styled('div')(() => ({
    backgroundColor: '#2d91e0',
    width: '210px',
    height: '120px',
    borderRadius: '10px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    justifyContent: 'space-between',
    cursor: 'default',
  }));
  
  export const CardItemSection = styled('div')(() => ({
    display: 'flex',
  }));
  
  export const CardItemTopTypography = styled(Typography)(() => ({
    flexGrow: 1,
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
