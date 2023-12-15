import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../config/apiConfig';

export default createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: config.root,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');

      return headers;
    },
  }),
  endpoints: (builder) => ({
    test: builder.query({
      query: () => '/test',
    }),
  }),
});
