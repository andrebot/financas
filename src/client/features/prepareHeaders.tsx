import { BaseQueryApi } from '@reduxjs/toolkit/query/react';
import { RootState } from './store';

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
