import type { BaseQueryApi } from '@reduxjs/toolkit/query/react';
import type { 
  EndpointBuilder, 
  BaseQueryFn, 
  FetchArgs, 
  FetchBaseQueryError, 
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';

/**
 * Type alias for the API object passed to RTK Query's prepareHeaders function.
 */
export type RTKApi = Pick<BaseQueryApi, 'getState' | 'extra' | 'endpoint' | 'type' | 'forced'>;

export type ApiBuilder = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, 'BankAccount', '/api/v1'>
