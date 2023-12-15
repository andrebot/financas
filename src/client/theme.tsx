import { ThemeOptions, createTheme } from '@mui/material/styles';

type ThemeCollection = {
  [key: string]: ThemeOptions;
};

const theme: ThemeCollection = {
  dark: {
    palette: {
      mode: 'dark',
    },
  },
  light: {
    palette: {
      mode: 'light',
    },
  },
};

/**
 * Creating theme to be used in the App, this will reflect the change in the store
 */
export default function createMuiTheme(mode: string) {
  const selectedTheme = theme[mode] || theme.dark;

  return createTheme(selectedTheme);
}
