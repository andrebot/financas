import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import endpoints from './endpoints';
import config from '../../config/apiConfig';
import { prepareNonAuthHeaders } from '../prepareHeaders';

export const loginApi = createApi({
  reducerPath: 'loginApi',
  baseQuery: fetchBaseQuery({
    baseUrl: config.api.user,
    prepareHeaders: prepareNonAuthHeaders,
  }),
  endpoints,
});

export const { useLoginMutation } = loginApi;
