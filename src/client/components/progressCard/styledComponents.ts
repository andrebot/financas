import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

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

export const ProgressBarFill = styled(LinearProgress)({
  height: '100%',
  '& .MuiLinearProgress-bar': {
    borderRadius: 0,
  },
});

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
