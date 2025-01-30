import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { FetchArgs } from "@reduxjs/toolkit/query";

import type { LoginBody, LoginResponse, RegisterBody, RefreshTokenResponse } from '../../types/authContextType';

type ApiBuilder = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, "loginApi">

export default function testBuilder(builder: ApiBuilder) {
  return {
    login: builder.mutation<LoginResponse, LoginBody>({
      query: (body: LoginBody) => ({
        url: '/login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<LoginResponse, RegisterBody>({
      query: (body: RegisterBody) => ({
        url: '/register',
        method: 'POST',
        body,
      }),
    }),
    refreshToken: builder.query<RefreshTokenResponse, void>({
      query: () => ({
        url: '/refresh-tokens',
        method: 'POST',
      }),
    }),
  };
}
