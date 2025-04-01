// eslint-disable-next-line import/no-unresolved
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query';
import {
  BaseQueryFn, FetchBaseQueryError, FetchBaseQueryMeta, FetchArgs,
} from '@reduxjs/toolkit/query';

import type {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RefreshTokenResponse,
  ResetPasswordBody,
  DefaultServerResponse,
  UpdateUserBody,
  UpdateUserResponse,
  ChangePasswordBody,
} from '../../types/authContextType';

type ApiBuilder = EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, 'loginApi'>

export const loginMutation = (body: LoginBody) => ({
  url: '/login',
  method: 'POST',
  body,
});

export const registerMutation = (body: RegisterBody) => ({
  url: '/register',
  method: 'POST',
  body,
});

export const refreshTokenQuery = () => ({
  url: '/refresh-tokens',
  method: 'POST',
});

export const resetPasswordMutation = (body: ResetPasswordBody) => ({
  url: '/reset-password',
  method: 'POST',
  body,
});

export const logoutMutation = () => ({
  url: '/logout',
  method: 'POST',
});

export const updateUserMutation = ({ id, ...body }: UpdateUserBody) => ({
  url: `/${id}`,
  method: 'PUT',
  body,
});

export const changePasswordMutation = (body: ChangePasswordBody) => ({
  url: '/change-password',
  method: 'POST',
  body,
});

export const deleteAccountMutation = (id: string) => ({
  url: `/${id}`,
  method: 'DELETE',
});

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
    resetPassword: builder.mutation<DefaultServerResponse, ResetPasswordBody>({
      query: resetPasswordMutation,
    }),
    logout: builder.mutation<DefaultServerResponse, void>({
      query: logoutMutation,
    }),
    updateUser: builder.mutation<UpdateUserResponse, UpdateUserBody>({
      query: updateUserMutation,
    }),
    changePassword: builder.mutation<DefaultServerResponse, ChangePasswordBody>({
      query: changePasswordMutation,
    }),
    deleteAccount: builder.mutation<DefaultServerResponse, string>({
      query: deleteAccountMutation,
    }),
  };
}
