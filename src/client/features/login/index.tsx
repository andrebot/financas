import baseApi from '../apiSlice';
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

export const loginMutation = (body: LoginBody) => ({
  url: '/user/login',
  method: 'POST',
  body,
});

export const registerMutation = (body: RegisterBody) => ({
  url: '/user/register',
  method: 'POST',
  body,
});

export const refreshTokenQuery = () => ({
  url: '/user/refresh-tokens',
  method: 'POST',
});

export const resetPasswordMutation = (body: ResetPasswordBody) => ({
  url: '/user/reset-password',
  method: 'POST',
  body,
});

export const logoutMutation = () => ({
  url: '/user/logout',
  method: 'POST',
});

export const updateUserMutation = ({ id, ...body }: UpdateUserBody) => ({
  url: `/user/${id}`,
  method: 'PUT',
  body,
});

export const changePasswordMutation = (body: ChangePasswordBody) => ({
  url: '/user/change-password',
  method: 'POST',
  body,
});

export const deleteAccountMutation = (id: string) => ({
  url: `/user/${id}`,
  method: 'DELETE',
});

export const loginApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenQuery,
  useResetPasswordMutation,
  useLogoutMutation,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = loginApi;
