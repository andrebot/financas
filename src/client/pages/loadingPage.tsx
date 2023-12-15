import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

const loadingPage = {
  backgroundColor: 'lightgray',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

/**
 * This is a very simple loading page so we do not have a blank if
 * the page is dangling
 */
export default function LoadingPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Container sx={loadingPage}>
      <Typography variant="h5" component="div" align="center" gutterBottom>
        {t('loading')}
      </Typography>

      {/* Loading circle */}
      <CircularProgress />
    </Container>
  );
}
