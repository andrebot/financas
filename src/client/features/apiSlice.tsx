import {
  createApi,
  fetchBaseQuery,
  FetchArgs,
} from '@reduxjs/toolkit/query/react';
import { RootState } from './store';
import { setAccessToken, clearAccessToken } from './authSlice';
import config from '../config/apiConfig';
import type { RefreshTokenResponse } from '../types/authContextType';
import type { RTKApi } from '../types/requests';

/**
 * Prepare the headers for the API requests for simple
 * non authenticated requests
 *
 * @param headers - The headers to be prepared
 * @param getState - The getState function from the store
 * @returns The prepared headers
 */
export function prepareHeaders(headers: Headers, api: RTKApi) {
  const { accessToken } = (api.getState() as RootState).auth;
  headers.set('Content-Type', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
}

const baseQuery = fetchBaseQuery({
  baseUrl: config.root,
  prepareHeaders,
});

/**
 * Base query with reauth for the API requests.
 *
 * @param args - The arguments to the query
 * @param api - The API object
 * @param extraOptions - The extra options for the query
 * @returns The result of the query
 */
export async function baseQueryWithReauth(
  args: string | FetchArgs,
  api: any,
  extraOptions: any,
) {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.meta?.response?.status === 401) {
    const refreshResult = await baseQuery('/refresh-tokens', api, extraOptions);

    if (refreshResult.data) {
      api.dispatch(setAccessToken((refreshResult.data as RefreshTokenResponse).accessToken));
      result = await baseQuery(args, api, extraOptions);
    } else {
      /**
       * If the refresh token request fails, we clear the access token to ensure
       * the user is logged out on the client side. Previously this also triggered
       * the logout mutation from `loginApi`, but that created a circular dependency
       * between `apiSlice` and `login`. To avoid that runtime issue (and failing
       * tests), we now only clear the token here.
       */
      api.dispatch(clearAccessToken());
    }
  }

  return result;
}

export default createApi({
  reducerPath: '/api/v1',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['BankAccount', 'Category', 'Goal'],
  endpoints: () => ({}),
});
