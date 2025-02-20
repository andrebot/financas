import {
  createApi,
} from '@reduxjs/toolkit/query/react';
import endpoints from './endpoints';
import baseQueryWithReauth from '../baseQueryWithAuth';

// Figuring out how to refresh access token. GPT has a suggestion
export const loginApi = createApi({
  reducerPath: 'loginApi',
  baseQuery: baseQueryWithReauth,
  endpoints,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenQuery,
  useResetPasswordMutation,
  useLogoutMutation,
} = loginApi;
