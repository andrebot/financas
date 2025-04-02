import React from 'react';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CssBaseLine from '@mui/material/CssBaseline';
import './i18n';

import createMuiTheme from './theme';
import Router from './routes';
import { AuthProvider } from './hooks/authContext';
import ModalProvider from './components/modal/modal';
import { useAppSelector } from './hooks/index';

function App() {
  const currentTheme = useAppSelector((state) => state.theme);
  const muiTheme = createMuiTheme(currentTheme);

  return (
    <AuthProvider>
      <ThemeProvider theme={muiTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider maxSnack={3}>
            <ModalProvider>
              <CssBaseLine />
              <Router />
            </ModalProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
