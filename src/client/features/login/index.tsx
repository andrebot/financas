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
import type { ApiBuilder } from '../../types/requests';

/**
 * Mutation for logging in a user.
 * @param body - The body of the request.
 * @returns The mutation object.
 */
export const loginMutation = (body: LoginBody) => ({
  url: '/user/login',
  method: 'POST',
  body,
});

/**
 * Mutation for registering a user.
 * @param body - The body of the request.
 * @returns The mutation object.
 */
export const registerMutation = (body: RegisterBody) => ({
  url: '/user/register',
  method: 'POST',
  body,
});

/**
 * Query for refreshing a token.
 * @returns The query object.
 */
export const refreshTokenQuery = () => ({
  url: '/user/refresh-tokens',
  method: 'POST',
});

/**
 * Mutation for resetting a password.
 * @param body - The body of the request.
 * @returns The mutation object.
 */
export const resetPasswordMutation = (body: ResetPasswordBody) => ({
  url: '/user/reset-password',
  method: 'POST',
  body,
});

/**
 * Mutation for logging out a user.
 * @returns The mutation object.
 */
export const logoutMutation = () => ({
  url: '/user/logout',
  method: 'POST',
});

/**
 * Mutation for updating a user.
 * @param id - The id of the user.
 * @param body - The body of the request.
 * @returns The mutation object.
 */
export const updateUserMutation = ({ id, ...body }: UpdateUserBody) => ({
  url: `/user/${id}`,
  method: 'PUT',
  body,
});

/**
 * Mutation for changing a password.
 * @param body - The body of the request.
 * @returns The mutation object.
 */
export const changePasswordMutation = (body: ChangePasswordBody) => ({
  url: '/user/change-password',
  method: 'POST',
  body,
});

/**
 * Mutation for deleting a user.
 * @param id - The id of the user.
 * @returns The mutation object.
 */
export const deleteAccountMutation = (id: string) => ({
  url: `/user/${id}`,
  method: 'DELETE',
});

// This was done so testing would be easier.
export const endpoints = (builder: ApiBuilder) => ({
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
});

export const loginApi = baseApi.injectEndpoints({
  endpoints,
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
