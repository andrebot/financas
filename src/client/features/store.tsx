import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import { apiSlice } from './testAPI';

/**
 * Configuring store for the application.
 */
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(apiSlice.middleware),
});

/**
 * This will automatically type the dispatch function for this application
 */
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
