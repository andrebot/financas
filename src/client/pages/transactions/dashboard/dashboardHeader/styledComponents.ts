import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { StyleCompProp } from '../../../../types';

/** Container for the year carousel and month tabs. */
export const DashboardHeaderWrapper = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

/** Row that holds the left chevron, year label, right chevron, and the year menu anchor. */
export const YearCarousel = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

/** Clickable year text that opens the year picker dropdown. */
export const YearLabel = styled(Typography)(({ theme }: StyleCompProp) => ({
  cursor: 'pointer',
  userSelect: 'none',
  fontWeight: theme.typography.fontWeightBold,
  padding: theme.spacing(0, 1),
  '&:hover': {
    textDecoration: 'underline',
  },
}));
