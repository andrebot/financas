import themeReducer, { toggleTheme } from '../../../../src/client/features/theme/themeSlice';

describe('themeSlice', () => {
  it('should return the initial state', () => {
    expect(themeReducer(undefined, { type: undefined })).toBe('dark');
  });

  it('should toggle the theme from dark to light', () => {
    const previousState = 'dark';
    expect(themeReducer(previousState, toggleTheme())).toBe('light');
  });

  it('should toggle the theme from light to dark', () => {
    const previousState = 'light';
    expect(themeReducer(previousState, toggleTheme())).toBe('dark');
  });
});
