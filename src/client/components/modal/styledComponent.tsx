import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { StyleCompProp } from '../../types';

const ModalWrapper = styled(Box)(({ theme }: StyleCompProp) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: '24px',
  background: theme.palette.background.paper,
  [theme.breakpoints.down('md')]: {
    top: '0',
    left: '0',
    transform: 'none',
    width: '100%',
    height: '100vh',
  },
}));

export default ModalWrapper;
