import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

export const ProgressBarWrapper = styled(Paper)(() => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  gap: '10px',
  width: '250px',
}));

export const ProgressBarContainer = styled('div')({
  position: 'relative',
  height: '24px',
  width: '100%',
  borderRadius: 4,
  overflow: 'hidden',
});

export const ItemBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}));

export const ProgressBarFill = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== 'barcolor',
})<{ barcolor: string }>(({ barcolor }) => ({
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.08)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 0,
    backgroundColor: barcolor,
  },
}));

export const ProgressBarLabel = styled(Typography)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: 'white',
  mixBlendMode: 'difference',
  pointerEvents: 'none',
});
