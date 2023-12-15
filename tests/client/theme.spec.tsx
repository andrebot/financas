import { createTheme } from '@mui/material/styles';
import createMuiTheme from '../../src/client/theme';

jest.mock('@mui/material/styles', () => ({
  createTheme: jest.fn(),
}));

describe('createMuiTheme', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a dark theme', () => {
    createMuiTheme('dark');
    expect(createTheme).toHaveBeenCalledWith({
      palette: {
        mode: 'dark',
      },
    });
  });

  it('should create a light theme', () => {
    createMuiTheme('light');
    expect(createTheme).toHaveBeenCalledWith({
      palette: {
        mode: 'light',
      },
    });
  });

  it('should handle unknown themes', () => {
    const unknownTheme = createMuiTheme('unknown');
    // Assuming default behavior for unknown theme is to return a light theme or throw an error
    expect(createTheme).toHaveBeenCalledWith({
      palette: {
        mode: 'dark',
      },
    });
  });
});
