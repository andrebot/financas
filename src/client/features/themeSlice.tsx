import { createSlice } from '@reduxjs/toolkit';

const initialState = 'dark';

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
      return state === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
