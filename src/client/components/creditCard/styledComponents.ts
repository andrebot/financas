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
    cursor: 'default'
  }));
  
  export const CardItemSection = styled('div')(() => ({
    display: 'flex',
  }));
  
  export const CardItemTopTypography = styled(Typography)(() => ({
    flexGrow: 1,
  }));
