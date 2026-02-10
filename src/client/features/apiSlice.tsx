import {
  createApi,
  fetchBaseQuery,
  FetchArgs,
  BaseQueryApi,
} from '@reduxjs/toolkit/query/react';
import { RootState } from './store';
import { loginApi } from "./login";
import { setAccessToken, clearAccessToken } from "./authSlice";
import config from "../config/apiConfig";
import type { RefreshTokenResponse } from "../types/authContextType";

/**
 * Type alias for the API object passed to RTK Query's prepareHeaders function.
 */
export type RTKApi = Pick<BaseQueryApi, 'getState' | 'extra' | 'endpoint' | 'type' | 'forced'>;

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
export async function baseQueryWithReauth (
  args: string | FetchArgs, 
  api: any, extraOptions: any,
) {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.meta?.response?.status === 401) {
    const refreshResult = await baseQuery('/refresh-tokens', api, extraOptions);

    if (refreshResult.data) {
      api.dispatch(setAccessToken((refreshResult.data as RefreshTokenResponse).accessToken))
      result = await baseQuery(args, api, extraOptions)
    } else {
      await api.dispatch(loginApi.endpoints.logout.initiate());
      api.dispatch(clearAccessToken())
    }
  }

  return result
}

// Figuring out how to refresh access token. GPT has a suggestion
export default createApi({
  reducerPath: '/api/v1',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
