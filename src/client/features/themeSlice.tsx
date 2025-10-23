import { createSlice } from '@reduxjs/toolkit';

const initialState = localStorage.getItem('theme') || 'dark';

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Toggles the state that the theme is right now
     *
     * @param state Slice state
     * @returns Which state the theme: dark or light
     */
    toggleTheme(state): string {
      const newState = state === 'light' ? 'dark' : 'light';

      localStorage.setItem('theme', newState);
      return newState;
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
