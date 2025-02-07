import { EndpointBuilder } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { FetchBaseQueryMeta } from "@reduxjs/toolkit/query";
import { FetchArgs } from "@reduxjs/toolkit/query";

import type {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RefreshTokenResponse,
  ResetPasswordBody,
  ResetPasswordResponse,
} from '../../types/authContextType';

type ApiBuilder = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, "loginApi">

export const loginMutation = (body: LoginBody) => ({
  url: '/login',
  method: 'POST',
  body,
})

export const registerMutation = (body: RegisterBody) => ({
  url: '/register',
  method: 'POST',
  body,
})

export const refreshTokenQuery = () => ({
  url: '/refresh-tokens',
  method: 'POST',
})

export const resetPasswordMutation = (body: ResetPasswordBody) => ({
  url: '/reset-password',
  method: 'POST',
  body,
})

export default function testBuilder(builder: ApiBuilder) {
  return {
    login: builder.mutation<LoginResponse, LoginBody>({
      query: loginMutation,
    }),
    register: builder.mutation<LoginResponse, RegisterBody>({
      query: registerMutation,
    }),
    refreshToken: builder.query<RefreshTokenResponse, void>({
      query: refreshTokenQuery,
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordBody>({
      query: resetPasswordMutation,
    }),
  };
}
