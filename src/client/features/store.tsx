import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import { loginApi } from './login';
import authReducer from './authSlice';

/**
 * Configuring store for the application.
 */
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    [loginApi.reducerPath]: loginApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(loginApi.middleware),
});

/**
 * This will automatically type the dispatch function for this application
 */
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
