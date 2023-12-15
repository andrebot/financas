import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import backendAPISlice from '../features/apiSlice';

/**
 * Configuring store for the application.
 */
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    [backendAPISlice.reducerPath]: backendAPISlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(backendAPISlice.middleware),
});

/**
 * This will automatically type the dispatch function for this application
 */
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
