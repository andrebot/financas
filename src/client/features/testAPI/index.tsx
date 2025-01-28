import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import endpoints from './endpoints';
import config from '../../config/apiConfig';

export const prepareHeaders = (headers: Headers) => {
  headers.set('Content-Type', 'application/json');
  return headers;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: config.root,
    prepareHeaders,
  }),
  endpoints,
});

export const { useTestQuery } = apiSlice;
